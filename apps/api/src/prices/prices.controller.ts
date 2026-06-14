import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PriceInsights, PricePoint, PricesService } from './prices.service'

@Controller('prices')
@UseGuards(JwtAuthGuard)
export class PricesController {
  constructor(private readonly prices: PricesService) {}

  @Get('crops')
  crops(): Promise<string[]> {
    return this.prices.crops()
  }

  @Get('regions')
  regions(): Promise<string[]> {
    return this.prices.regions()
  }

  @Get('insights')
  insights(@Query('crop') crop: string): Promise<PriceInsights> {
    return this.prices.insights(crop)
  }

  @Get()
  series(@Query('crop') crop: string, @Query('region') region?: string): Promise<PricePoint[]> {
    return this.prices.series(crop, region)
  }
}
