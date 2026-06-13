import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { StatsService, OverviewStats } from './stats.service'

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  overview(@CurrentUser() user: JwtPayload): Promise<OverviewStats> {
    return this.statsService.getOverview(user.sub, user.role)
  }
}
