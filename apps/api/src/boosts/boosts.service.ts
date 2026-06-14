import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { BoostRecord } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { PaystackService } from '../transactions/paystack.service'

// Boost pricing by duration (GH₵), per the business plan's GH₵20–150 range.
const PRICE_BY_DAYS: Record<number, number> = { 7: 20, 14: 35, 30: 50 }

export interface BoostResult {
  authorizationUrl: string
  reference: string
}

@Injectable()
export class BoostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly config: ConfigService
  ) {}

  async createBoost(
    userId: string,
    email: string,
    targetType: 'listing' | 'campaign',
    targetId: string,
    days: number
  ): Promise<BoostResult> {
    const price = PRICE_BY_DAYS[days]
    if (!price) {
      throw new BadRequestException('Boost duration must be 7, 14, or 30 days')
    }
    await this.assertOwnership(userId, targetType, targetId)

    const frontendUrl = (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000')
      .split(',')[0]
      .trim()
    const callback =
      targetType === 'listing'
        ? `${frontendUrl}/dashboard/listings`
        : `${frontendUrl}/dashboard/campaigns`

    const init = await this.paystack.initialize(
      email,
      price,
      { type: 'BOOST', targetType, targetId, userId, days },
      callback
    )

    const now = new Date()
    await this.prisma.boostRecord.create({
      data: {
        userId,
        targetType,
        targetId,
        priceGhs: price,
        startsAt: now,
        expiresAt: new Date(now.getTime() + days * 86_400_000),
        active: false,
        paystackReference: init.reference,
      },
    })

    return { authorizationUrl: init.authorizationUrl, reference: init.reference }
  }

  async verify(userId: string, reference: string): Promise<BoostRecord> {
    const boost = await this.prisma.boostRecord.findUnique({ where: { paystackReference: reference } })
    if (!boost) {
      throw new NotFoundException('Boost not found')
    }
    if (boost.userId !== userId) {
      throw new ForbiddenException('This boost is not yours')
    }
    if (boost.active) {
      return boost
    }

    const result = await this.paystack.verify(reference)
    if (result.status !== 'success') {
      return boost
    }

    const durationMs = boost.expiresAt.getTime() - boost.startsAt.getTime()
    const now = new Date()
    return this.prisma.boostRecord.update({
      where: { id: boost.id },
      data: { active: true, startsAt: now, expiresAt: new Date(now.getTime() + durationMs) },
    })
  }

  myBoosts(userId: string): Promise<BoostRecord[]> {
    return this.prisma.boostRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  /** Target ids with a live boost, for marketplace ranking. */
  async activeTargetIds(targetType: string, ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set()
    const rows = await this.prisma.boostRecord.findMany({
      where: { targetType, active: true, expiresAt: { gt: new Date() }, targetId: { in: ids } },
      select: { targetId: true },
    })
    return new Set(rows.map((r) => r.targetId))
  }

  private async assertOwnership(
    userId: string,
    targetType: 'listing' | 'campaign',
    targetId: string
  ): Promise<void> {
    if (targetType === 'listing') {
      const listing = await this.prisma.listing.findUnique({
        where: { id: targetId },
        select: { farm: { select: { farmerId: true } } },
      })
      if (!listing) throw new NotFoundException('Listing not found')
      if (listing.farm.farmerId !== userId) throw new ForbiddenException('You do not own this listing')
    } else {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: targetId },
        select: { farm: { select: { farmerId: true } } },
      })
      if (!campaign) throw new NotFoundException('Campaign not found')
      if (campaign.farm.farmerId !== userId) throw new ForbiddenException('You do not own this campaign')
    }
  }
}
