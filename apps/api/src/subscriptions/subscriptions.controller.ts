import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { IsUUID } from 'class-validator'
import { SubscriptionPlan } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { MySubscription, SubscribeResult, SubscriptionsService } from './subscriptions.service'

class SubscribeDto {
  @IsUUID()
  planId!: string
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get('plans')
  plans(): Promise<SubscriptionPlan[]> {
    return this.subscriptions.listPlans()
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload): Promise<MySubscription> {
    return this.subscriptions.mySubscription(user.sub)
  }

  @Post('subscribe')
  subscribe(@CurrentUser() user: JwtPayload, @Body() dto: SubscribeDto): Promise<SubscribeResult> {
    return this.subscriptions.subscribe(user.sub, user.email, dto.planId)
  }

  @Post('verify/:reference')
  verify(
    @CurrentUser() user: JwtPayload,
    @Param('reference') reference: string
  ): Promise<MySubscription> {
    return this.subscriptions.verify(user.sub, reference)
  }
}
