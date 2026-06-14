import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Listing, Transaction } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { TrustService } from '../trust/trust.service'
import { NotificationsService } from '../notifications/notifications.service'

interface PersonLite {
  id: string
  fullName: string | null
  email: string
  role: string
}

export interface AdminMetrics {
  usersByRole: Record<string, number>
  totalUsers: number
  listings: number
  campaigns: number
  gmv: number
  escrowHeld: number
  openDisputes: number
  pendingKyc: number
}

export interface DisputeView {
  transaction: Transaction
  buyer: PersonLite | null
  seller: PersonLite | null
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trust: TrustService,
    private readonly notifications: NotificationsService
  ) {}

  async metrics(): Promise<AdminMetrics> {
    const [grouped, listings, campaigns, gmvAgg, heldAgg, openDisputes, pendingKyc] =
      await Promise.all([
        this.prisma.profile.groupBy({ by: ['role'], _count: { _all: true } }),
        this.prisma.listing.count(),
        this.prisma.campaign.count(),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { escrowStatus: 'RELEASED' },
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { escrowStatus: 'HELD' },
        }),
        this.prisma.transaction.count({ where: { escrowStatus: 'DISPUTED' } }),
        this.prisma.profile.count({ where: { kycStatus: 'PENDING' } }),
      ])

    const usersByRole: Record<string, number> = {}
    let totalUsers = 0
    for (const row of grouped) {
      usersByRole[row.role] = row._count._all
      totalUsers += row._count._all
    }

    return {
      usersByRole,
      totalUsers,
      listings,
      campaigns,
      gmv: gmvAgg._sum.amount ?? 0,
      escrowHeld: heldAgg._sum.amount ?? 0,
      openDisputes,
      pendingKyc,
    }
  }

  async disputes(): Promise<DisputeView[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { escrowStatus: 'DISPUTED' },
      orderBy: { updatedAt: 'desc' },
    })
    const people = await this.peopleMap(
      transactions.flatMap((t) => [t.buyerId, t.sellerId])
    )
    return transactions.map((transaction) => ({
      transaction,
      buyer: people.get(transaction.buyerId) ?? null,
      seller: people.get(transaction.sellerId) ?? null,
    }))
  }

  /** Admin resolves a disputed escrow: release funds to seller or refund buyer. */
  async resolveDispute(
    transactionId: string,
    resolution: 'RELEASE' | 'REFUND'
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } })
    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }
    if (transaction.escrowStatus !== 'DISPUTED') {
      throw new BadRequestException('Only disputed transactions can be resolved')
    }

    const newStatus = resolution === 'RELEASE' ? 'RELEASED' : 'REFUNDED'
    const updated = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { escrowStatus: newStatus },
    })

    if (resolution === 'RELEASE') {
      await this.trust.recomputeQuietly(transaction.buyerId)
      await this.trust.recomputeQuietly(transaction.sellerId)
    }

    const crop = transaction.crop ?? 'order'
    await this.notifications.notifyQuietly({
      userId: transaction.sellerId,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute resolved',
      body:
        resolution === 'RELEASE'
          ? `Your ${crop} payment was released to you.`
          : `The ${crop} order was refunded to the buyer.`,
      actionUrl: '/dashboard/orders',
    })
    await this.notifications.notifyQuietly({
      userId: transaction.buyerId,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute resolved',
      body:
        resolution === 'RELEASE'
          ? `Your ${crop} dispute was closed and the payment released to the seller.`
          : `You were refunded for the ${crop} order.`,
      actionUrl: '/dashboard/orders',
    })

    return updated
  }

  async pendingKyc(): Promise<PersonLite[]> {
    const users = await this.prisma.profile.findMany({
      where: { kycStatus: 'PENDING' },
      select: { id: true, fullName: true, email: true, role: true },
      orderBy: { createdAt: 'asc' },
    })
    return users
  }

  async decideKyc(userId: string, decision: 'VERIFIED' | 'REJECTED'): Promise<PersonLite> {
    const user = await this.prisma.profile.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const updated = await this.prisma.profile.update({
      where: { id: userId },
      data: { kycStatus: decision },
      select: { id: true, fullName: true, email: true, role: true },
    })

    await this.trust.recomputeQuietly(userId)
    await this.notifications.notifyQuietly({
      userId,
      type: 'KYC_DECISION',
      title: decision === 'VERIFIED' ? 'Identity verified' : 'Verification declined',
      body:
        decision === 'VERIFIED'
          ? 'Your identity is verified — you now have a verified badge and a trust boost.'
          : 'Your identity verification was declined. You can resubmit updated details.',
      actionUrl: '/dashboard/settings',
    })

    return updated
  }

  recentListings(): Promise<Listing[]> {
    return this.prisma.listing.findMany({
      include: { farm: { select: { id: true, name: true, location: true, farmerId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async moderateListing(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<Listing> {
    const listing = await this.prisma.listing.findUnique({ where: { id } })
    if (!listing) {
      throw new NotFoundException('Listing not found')
    }
    return this.prisma.listing.update({ where: { id }, data: { status } })
  }

  private async peopleMap(ids: string[]): Promise<Map<string, PersonLite>> {
    const unique = [...new Set(ids)]
    const people = await this.prisma.profile.findMany({
      where: { id: { in: unique } },
      select: { id: true, fullName: true, email: true, role: true },
    })
    return new Map(people.map((p) => [p.id, p]))
  }
}
