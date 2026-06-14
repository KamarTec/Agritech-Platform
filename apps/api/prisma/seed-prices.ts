/**
 * Seeds 12 months of monthly crop price history (synthetic but seasonally
 * realistic) for Ghanaian crops across regions. Clears existing rows first.
 * Run: npx ts-node prisma/seed-prices.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const REGIONS = ['Greater Accra', 'Ashanti', 'Northern']
// base GH₵/kg, seasonal swing amplitude, peak month (0-11) when supply is scarce
const CROPS: { crop: string; base: number; swing: number; peakMonth: number }[] = [
  { crop: 'Tomatoes', base: 5.5, swing: 2.5, peakMonth: 2 },
  { crop: 'Maize', base: 3.0, swing: 1.0, peakMonth: 5 },
  { crop: 'Cassava', base: 2.0, swing: 0.6, peakMonth: 8 },
  { crop: 'Onions', base: 6.0, swing: 2.2, peakMonth: 3 },
  { crop: 'Plantain', base: 4.0, swing: 1.2, peakMonth: 10 },
  { crop: 'Rice', base: 7.5, swing: 1.5, peakMonth: 6 },
  { crop: 'Yam', base: 5.0, swing: 1.8, peakMonth: 1 },
  { crop: 'Pepper', base: 8.0, swing: 3.0, peakMonth: 4 },
]

const MONTHS = 12

function priceFor(base: number, swing: number, peakMonth: number, monthIdx: number, regionMul: number): number {
  // Cosine peaks at peakMonth; +/- small deterministic jitter.
  const phase = ((monthIdx - peakMonth) / 12) * 2 * Math.PI
  const seasonal = Math.cos(phase) * swing
  const jitter = (Math.sin(monthIdx * 3.7 + base) * 0.15) * base
  return Math.round((base + seasonal + jitter) * regionMul * 100) / 100
}

async function main(): Promise<void> {
  await prisma.priceHistory.deleteMany({})

  const now = new Date()
  const rows: { crop: string; region: string; pricePerKg: number; recordedDate: Date }[] = []

  for (let m = MONTHS - 1; m >= 0; m--) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const monthIdx = date.getMonth()
    REGIONS.forEach((region, ri) => {
      const regionMul = 1 + (ri - 1) * 0.06 // regions differ slightly
      for (const c of CROPS) {
        rows.push({
          crop: c.crop,
          region,
          pricePerKg: Math.max(0.5, priceFor(c.base, c.swing, c.peakMonth, monthIdx, regionMul)),
          recordedDate: date,
        })
      }
    })
  }

  await prisma.priceHistory.createMany({ data: rows })
  console.log(`Seeded ${rows.length} price points (${CROPS.length} crops × ${REGIONS.length} regions × ${MONTHS} months).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
