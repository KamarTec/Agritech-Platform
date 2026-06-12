import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Transaction } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PaystackService } from './paystack.service'

// Fee model from the business plan: 2.5% marketplace + 0.5% escrow handling.
const MARKETPLACE_FEE_PCT = 2.5
const ESCROW_FEE_PCT = 0.5

export interface InitializeOrderResult {
  transactionId: string
  authorizationUrl: string
  reference: string
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly config: ConfigService
  ) {}

  /** Buyer starts an escrow-protected order for a marketplace listing. */
  async initializeOrder(
    buyerId: string,
    buyerEmail: string,
    listingId: string,
    quantityKg: number
  ): Promise<InitializeOrderResult> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { farm: { select: { farmerId: true, name: true } } },
    })
    if (!listing) {
      throw new NotFoundException('Listing not found')
    }
    if (listing.status !== 'ACTIVE') {
      throw new BadRequestException('This listing is no longer available')
    }
    if (listing.farm.farmerId === buyerId) {
      throw new BadRequestException('You cannot order your own produce')
    }
    if (quantityKg <= 0 || quantityKg > listing.quantityKg) {
      throw new BadRequestException(
        `Quantity must be between 0 and ${listing.quantityKg} kg (available stock)`
      )
    }

    const amount = Math.round(listing.pricePerKg * quantityKg * 100) / 100
    const platformFee =
      Math.round(amount * ((MARKETPLACE_FEE_PCT + ESCROW_FEE_PCT) / 100) * 100) / 100

    const frontendUrl = (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000')
      .split(',')[0]
      .trim()

    const init = await this.paystack.initialize(
      buyerEmail,
      amount,
      { listingId, buyerId, sellerId: listing.farm.farmerId, type: 'MARKETPLACE' },
      `${frontendUrl}/dashboard/orders`
    )

    const transaction = await this.prisma.transaction.create({
      data: {
        type: 'MARKETPLACE',
        buyerId,
        sellerId: listing.farm.farmerId,
        listingId,
        crop: listing.crop,
        quantityKg,
        amount,
        platformFee,
        paystackReference: init.reference,
        escrowStatus: 'PENDING',
      },
    })

    return {
      transactionId: transaction.id,
      authorizationUrl: init.authorizationUrl,
      reference: init.reference,
    }
  }

  /** Buyer returns from Paystack checkout — verify and move to HELD. */
  async verifyPayment(reference: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { paystackReference: reference },
    })
    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }
    if (transaction.escrowStatus !== 'PENDING') {
      return transaction // already settled by webhook or earlier verify
    }

    const result = await this.paystack.verify(reference)
    if (result.status !== 'success') {
      return transaction
    }

    return this.markHeld(reference)
  }

  /** Webhook path: charge.success → escrow HELD. Idempotent. */
  async markHeld(reference: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { paystackReference: reference },
    })
    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }
    if (transaction.escrowStatus !== 'PENDING') {
      return transaction
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { paystackReference: reference },
        data: { escrowStatus: 'HELD' },
      }),
      this.prisma.platformFee.create({
        data: {
          transactionId: transaction.id,
          feeType: 'marketplace+escrow',
          feeAmount: transaction.platformFee,
          paystackReference: reference,
        },
      }),
      // Reduce remaining stock; mark SOLD when bought out.
      ...(transaction.listingId && transaction.quantityKg
        ? [
            this.prisma.listing.update({
              where: { id: transaction.listingId },
              data: { quantityKg: { decrement: transaction.quantityKg } },
            }),
          ]
        : []),
    ])

    if (transaction.listingId) {
      await this.prisma.listing.updateMany({
        where: { id: transaction.listingId, quantityKg: { lte: 0 } },
        data: { status: 'SOLD' },
      })
    }

    return updated
  }

  /** Buyer confirms delivery — funds released to the farmer. */
  async confirmDelivery(transactionId: string, buyerId: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    })
    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }
    if (transaction.buyerId !== buyerId) {
      throw new ForbiddenException('Only the buyer can confirm delivery')
    }
    if (transaction.escrowStatus !== 'HELD') {
      throw new BadRequestException(
        `Only held payments can be released (current: ${transaction.escrowStatus})`
      )
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { escrowStatus: 'RELEASED' },
    })
  }

  /** Either party can flag a dispute on a held payment. */
  async dispute(transactionId: string, userId: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    })
    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenException('You are not part of this transaction')
    }
    if (transaction.escrowStatus !== 'HELD') {
      throw new BadRequestException('Only held payments can be disputed')
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { escrowStatus: 'DISPUTED' },
    })
  }

  /** All transactions where the user is buyer or seller. */
  async findMine(userId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      orderBy: { createdAt: 'desc' },
    })
  }
}
