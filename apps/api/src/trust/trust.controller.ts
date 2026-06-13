import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { TrustService, TrustBreakdown } from './trust.service'

@Controller('trust')
@UseGuards(JwtAuthGuard)
export class TrustController {
  constructor(private readonly trustService: TrustService) {}

  /** Recomputes and returns the current user's trust score breakdown. */
  @Get('me')
  me(@CurrentUser() user: JwtPayload): Promise<TrustBreakdown> {
    return this.trustService.recompute(user.sub)
  }
}
