import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { SubscriptionPlan } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PaystackService } from '../transactions/paystack.service'
import { ConfigService } from '@nestjs/config'

const PERIOD_DAYS = 30

export interface MySubscription {
  plan: SubscriptionPlan | null // null = Free
  status: string
  currentPeriodEnd: string | null
}

export interface SubscribeResult {
  authorizationUrl: string
  reference: string
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly config: ConfigService
  ) {}

  listPlans(): Promise<SubscriptionPlan[]> {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { priceGhs: 'asc' } })
  }

  async mySubscription(userId: string): Promise<MySubscription> {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    })
    if (sub && sub.status === 'ACTIVE' && sub.currentPeriodEnd > new Date()) {
      return {
        plan: sub.plan,
        status: 'ACTIVE',
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      }
    }
    return { plan: null, status: 'FREE', currentPeriodEnd: null }
  }

  /** Active paid plan name, or null when on Free. Used for feature gates. */
  async activePlanName(userId: string): Promise<string | null> {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: { select: { name: true } } },
    })
    if (sub && sub.status === 'ACTIVE' && sub.currentPeriodEnd > new Date()) {
      return sub.plan.name
    }
    return null
  }

  async subscribe(userId: string, email: string, planId: string): Promise<SubscribeResult> {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } })
    if (!plan) {
      throw new NotFoundException('Plan not found')
    }
    if (plan.priceGhs <= 0) {
      throw new BadRequestException('Free is the default plan — no payment needed')
    }

    const frontendUrl = (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000')
      .split(',')[0]
      .trim()

    const init = await this.paystack.initialize(
      email,
      plan.priceGhs,
      { type: 'SUBSCRIPTION', planId, userId },
      `${frontendUrl}/dashboard/billing`
    )

    // Pending subscription stores the chosen plan + reference; flipped ACTIVE on verify.
    await this.prisma.subscription.upsert({
      where: { userId },
      update: { planId, status: 'PAST_DUE', paystackSubCode: init.reference },
      create: {
        userId,
        planId,
        status: 'PAST_DUE',
        paystackSubCode: init.reference,
        currentPeriodEnd: new Date(),
      },
    })

    return { authorizationUrl: init.authorizationUrl, reference: init.reference }
  }

  async verify(userId: string, reference: string): Promise<MySubscription> {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } })
    if (!sub) {
      throw new NotFoundException('No pending subscription found')
    }
    if (sub.status === 'ACTIVE' && sub.currentPeriodEnd > new Date()) {
      return this.mySubscription(userId)
    }

    const result = await this.paystack.verify(reference)
    if (result.status === 'success') {
      const periodEnd = new Date(Date.now() + PERIOD_DAYS * 86_400_000)
      await this.prisma.subscription.update({
        where: { userId },
        data: { status: 'ACTIVE', currentPeriodEnd: periodEnd },
      })
    }
    return this.mySubscription(userId)
  }
}
