import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface DailyForecast {
  date: string
  tempMin: number
  tempMax: number
  condition: string
  icon: string
}

export interface WeatherResult {
  location: string
  days: DailyForecast[]
}

interface ForecastEntry {
  dt: number
  main: { temp_min: number; temp_max: number }
  weather: { main: string; icon: string }[]
}

@Injectable()
export class WeatherService {
  constructor(private readonly config: ConfigService) {}

  private apiKey(): string {
    const key = (this.config.get<string>('OPENWEATHER_API_KEY') ?? '').trim()
    if (!key || key.includes('placeholder') || key.startsWith('your-')) {
      throw new ServiceUnavailableException('Weather is not configured yet (missing OpenWeather API key)')
    }
    return key
  }

  /** 5-day forecast (free tier, 3-hourly) aggregated to daily min/max + midday condition. */
  async forecast(lat: number, lng: number): Promise<WeatherResult> {
    const key = this.apiKey()
    try {
      const res = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: { lat, lon: lng, units: 'metric', appid: key },
        timeout: 20000,
      })

      const entries: ForecastEntry[] = res.data.list ?? []
      const byDay = new Map<string, ForecastEntry[]>()
      for (const e of entries) {
        const day = new Date(e.dt * 1000).toISOString().slice(0, 10)
        const arr = byDay.get(day) ?? []
        arr.push(e)
        byDay.set(day, arr)
      }

      const days: DailyForecast[] = [...byDay.entries()].slice(0, 5).map(([date, list]) => {
        const tempMin = Math.round(Math.min(...list.map((e) => e.main.temp_min)))
        const tempMax = Math.round(Math.max(...list.map((e) => e.main.temp_max)))
        // Representative condition: the entry closest to midday.
        const midday = list.reduce((best, e) =>
          Math.abs(new Date(e.dt * 1000).getHours() - 12) < Math.abs(new Date(best.dt * 1000).getHours() - 12) ? e : best
        )
        return {
          date,
          tempMin,
          tempMax,
          condition: midday.weather[0]?.main ?? 'Clear',
          icon: midday.weather[0]?.icon ?? '01d',
        }
      })

      return { location: res.data.city?.name ?? 'Your farm', days }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error
      const detail =
        axios.isAxiosError(error) && error.response
          ? JSON.stringify(error.response.data?.message ?? error.response.status)
          : 'network error'
      throw new ServiceUnavailableException(`Could not load the forecast (${detail})`)
    }
  }
}
