import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface PricePoint {
  recordedDate: string
  pricePerKg: number
  region: string
}

export interface PriceInsights {
  crop: string
  bestMonth: string | null
  bestMonthAvg: number
  latestAvg: number
  cheapestMonth: string | null
  dataPoints: number
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async crops(): Promise<string[]> {
    const rows = await this.prisma.priceHistory.findMany({
      distinct: ['crop'],
      select: { crop: true },
      orderBy: { crop: 'asc' },
    })
    return rows.map((r) => r.crop)
  }

  async regions(): Promise<string[]> {
    const rows = await this.prisma.priceHistory.findMany({
      distinct: ['region'],
      select: { region: true },
      orderBy: { region: 'asc' },
    })
    return rows.map((r) => r.region)
  }

  async series(crop: string, region?: string): Promise<PricePoint[]> {
    const rows = await this.prisma.priceHistory.findMany({
      where: { crop, ...(region ? { region } : {}) },
      orderBy: { recordedDate: 'asc' },
      select: { recordedDate: true, pricePerKg: true, region: true },
    })
    return rows.map((r) => ({
      recordedDate: r.recordedDate.toISOString(),
      pricePerKg: r.pricePerKg,
      region: r.region,
    }))
  }

  /** "Best time to sell" = calendar month with the highest average price. */
  async insights(crop: string): Promise<PriceInsights> {
    const rows = await this.prisma.priceHistory.findMany({
      where: { crop },
      select: { recordedDate: true, pricePerKg: true },
      orderBy: { recordedDate: 'asc' },
    })

    if (rows.length === 0) {
      return { crop, bestMonth: null, bestMonthAvg: 0, latestAvg: 0, cheapestMonth: null, dataPoints: 0 }
    }

    const byMonth = new Map<number, number[]>()
    for (const r of rows) {
      const month = r.recordedDate.getMonth()
      const arr = byMonth.get(month) ?? []
      arr.push(r.pricePerKg)
      byMonth.set(month, arr)
    }

    let bestMonth = 0
    let bestAvg = -Infinity
    let cheapMonth = 0
    let cheapAvg = Infinity
    for (const [month, prices] of byMonth) {
      const avg = prices.reduce((s, p) => s + p, 0) / prices.length
      if (avg > bestAvg) { bestAvg = avg; bestMonth = month }
      if (avg < cheapAvg) { cheapAvg = avg; cheapMonth = month }
    }

    const latestDate = rows[rows.length - 1].recordedDate
    const latest = rows.filter((r) => r.recordedDate.getTime() === latestDate.getTime())
    const latestAvg = latest.reduce((s, r) => s + r.pricePerKg, 0) / latest.length

    return {
      crop,
      bestMonth: MONTH_NAMES[bestMonth],
      bestMonthAvg: Math.round(bestAvg * 100) / 100,
      latestAvg: Math.round(latestAvg * 100) / 100,
      cheapestMonth: MONTH_NAMES[cheapMonth],
      dataPoints: rows.length,
    }
  }
}
