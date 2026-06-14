import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
import { IsIn } from 'class-validator'
import { Listing, Transaction } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../common/roles.guard'
import { Roles } from '../common/roles.decorator'
import { AdminMetrics, AdminService, DisputeView } from './admin.service'

class ResolveDisputeDto {
  @IsIn(['RELEASE', 'REFUND'])
  resolution!: 'RELEASE' | 'REFUND'
}

class KycDecisionDto {
  @IsIn(['VERIFIED', 'REJECTED'])
  decision!: 'VERIFIED' | 'REJECTED'
}

class ModerateListingDto {
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status!: 'ACTIVE' | 'SUSPENDED'
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('metrics')
  metrics(): Promise<AdminMetrics> {
    return this.admin.metrics()
  }

  @Get('disputes')
  disputes(): Promise<DisputeView[]> {
    return this.admin.disputes()
  }

  @Post('transactions/:id/resolve')
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveDisputeDto
  ): Promise<Transaction> {
    return this.admin.resolveDispute(id, dto.resolution)
  }

  @Get('kyc')
  kyc(): ReturnType<AdminService['pendingKyc']> {
    return this.admin.pendingKyc()
  }

  @Post('kyc/:userId')
  decideKyc(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: KycDecisionDto
  ): ReturnType<AdminService['decideKyc']> {
    return this.admin.decideKyc(userId, dto.decision)
  }

  @Get('listings')
  listings(): Promise<Listing[]> {
    return this.admin.recentListings()
  }

  @Post('listings/:id/moderate')
  moderate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ModerateListingDto
  ): Promise<Listing> {
    return this.admin.moderateListing(id, dto.status)
  }
}
