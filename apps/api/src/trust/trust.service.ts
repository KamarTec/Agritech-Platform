import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export type TrustTier = 'NEW' | 'BRONZE' | 'SILVER' | 'GOLD'

export interface TrustBreakdown {
  score: number
  tier: TrustTier
  kycPoints: number
  agePoints: number
  orderPoints: number
  completedOrders: number
  accountAgeDays: number
  kycStatus: string
}

// Points cap at 100. Verified KYC + ~10 weeks tenure + 5 completed orders = max.
const KYC_VERIFIED_POINTS = 30
const KYC_PENDING_POINTS = 5
const AGE_POINTS_PER_WEEK = 2
const AGE_POINTS_CAP = 20
const ORDER_POINTS_EACH = 10
const ORDER_POINTS_CAP = 50

@Injectable()
export class TrustService {
  constructor(private readonly prisma: PrismaService) {}

  static tierFor(score: number): TrustTier {
    if (score >= 75) return 'GOLD'
    if (score >= 50) return 'SILVER'
    if (score >= 25) return 'BRONZE'
    return 'NEW'
  }

  /** Recomputes a user's trust score from current data and persists it. */
  async recompute(userId: string): Promise<TrustBreakdown> {
    const user = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: { kycStatus: true, createdAt: true },
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const completedOrders = await this.prisma.transaction.count({
      where: {
        escrowStatus: 'RELEASED',
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    })

    const accountAgeDays = Math.max(
      0,
      Math.floor((Date.now() - user.createdAt.getTime()) / 86_400_000)
    )

    const kycPoints =
      user.kycStatus === 'VERIFIED'
        ? KYC_VERIFIED_POINTS
        : user.kycStatus === 'PENDING'
          ? KYC_PENDING_POINTS
          : 0
    const agePoints = Math.min(AGE_POINTS_CAP, Math.floor(accountAgeDays / 7) * AGE_POINTS_PER_WEEK)
    const orderPoints = Math.min(ORDER_POINTS_CAP, completedOrders * ORDER_POINTS_EACH)
    const score = Math.min(100, kycPoints + agePoints + orderPoints)

    await this.prisma.profile.update({
      where: { id: userId },
      data: { trustScore: score },
    })

    return {
      score,
      tier: TrustService.tierFor(score),
      kycPoints,
      agePoints,
      orderPoints,
      completedOrders,
      accountAgeDays,
      kycStatus: user.kycStatus,
    }
  }

  /** Best-effort recompute that never throws — for use in transaction side-effects. */
  async recomputeQuietly(userId: string): Promise<void> {
    try {
      await this.recompute(userId)
    } catch {
      // trust score is non-critical; never block the calling flow
    }
  }
}
