import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { IsIn, IsInt, IsUUID } from 'class-validator'
import { BoostRecord } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { BoostResult, BoostsService } from './boosts.service'

class CreateBoostDto {
  @IsIn(['listing', 'campaign'])
  targetType!: 'listing' | 'campaign'

  @IsUUID()
  targetId!: string

  @IsInt()
  @IsIn([7, 14, 30])
  days!: number
}

@Controller('boosts')
@UseGuards(JwtAuthGuard)
export class BoostsController {
  constructor(private readonly boosts: BoostsService) {}

  @Get('mine')
  mine(@CurrentUser() user: JwtPayload): Promise<BoostRecord[]> {
    return this.boosts.myBoosts(user.sub)
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBoostDto): Promise<BoostResult> {
    return this.boosts.createBoost(user.sub, user.email, dto.targetType, dto.targetId, dto.days)
  }

  @Post('verify/:reference')
  verify(
    @CurrentUser() user: JwtPayload,
    @Param('reference') reference: string
  ): Promise<BoostRecord> {
    return this.boosts.verify(user.sub, reference)
  }
}
