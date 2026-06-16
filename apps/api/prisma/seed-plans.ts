/**
 * Seeds the subscription plans. Idempotent (upsert by unique name).
 * Run: npx ts-node prisma/seed-plans.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PLANS: { name: string; priceGhs: number; features: string[] }[] = [
  { name: 'Free', priceGhs: 0, features: ['Up to 10 AI crop diagnoses / month', 'List produce & bid', 'Escrow-protected orders'] },
  { name: 'Farmer Pro', priceGhs: 49, features: ['100 AI crop diagnoses / month', 'Priority in demand matching', 'Boost discounts', 'Verified-seller perks'] },
  { name: 'Retailer Pro', priceGhs: 79, features: ['Unlimited demand requests', 'Priority bids', 'Bulk ordering tools'] },
  { name: 'Investor Pro', priceGhs: 99, features: ['Early access to campaigns', 'Portfolio analytics', 'Lower platform fees'] },
  { name: 'Business', priceGhs: 199, features: ['Everything in Pro', 'Team seats', 'Dedicated support', 'Featured banner boosts'] },
]

async function main(): Promise<void> {
  for (const plan of PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: { priceGhs: plan.priceGhs, features: plan.features },
      create: { name: plan.name, priceGhs: plan.priceGhs, features: plan.features },
    })
    console.log(`Seeded plan: ${plan.name} (GH₵${plan.priceGhs})`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
