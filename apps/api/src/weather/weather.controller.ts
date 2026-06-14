import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { Type } from 'class-transformer'
import { IsLatitude, IsLongitude } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { WeatherResult, WeatherService } from './weather.service'

class WeatherQueryDto {
  @Type(() => Number)
  @IsLatitude()
  lat!: number

  @Type(() => Number)
  @IsLongitude()
  lng!: number
}

@Controller('weather')
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(private readonly weather: WeatherService) {}

  @Get()
  forecast(@Query() query: WeatherQueryDto): Promise<WeatherResult> {
    return this.weather.forecast(query.lat, query.lng)
  }
}
