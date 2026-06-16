/**
 * Demo data for screenshots / live pitch demo. WIPEABLE & idempotent.
 * Clears all profile/content/transaction rows (keeps SubscriptionPlan + PriceHistory),
 * then seeds a believable, screenshot-ready dataset across all roles.
 *
 *   Run:   npx ts-node prisma/seed-demo.ts
 *   Wipe:  re-run it (it clears first) — or delete the demo profiles.
 *
 * Demo login (all accounts): password "demo1234"
 *   Farmer:    kwabena.asante.demo@gmail.com
 *   Retailer:  efua.boakye.demo@gmail.com
 *   Investor:  selorm.kudjoe.demo@gmail.com
 *   Admin:     admin@farmlink.test  (kept on .test; admin needs no Paystack)
 * Real-format gmail addresses are used so a LIVE Paystack checkout works
 * (Paystack rejects @farmlink.test emails).
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const PASSWORD = 'demo1234'

const ref = (): string => 'demo_' + Math.random().toString(36).slice(2, 12)
const daysAgo = (n: number): Date => new Date(Date.now() - n * 86_400_000)
const daysAhead = (n: number): Date => new Date(Date.now() + n * 86_400_000)
const round2 = (n: number): number => Math.round(n * 100) / 100
const FEE_PCT = 3 // 2.5% marketplace + 0.5% escrow

async function wipe(): Promise<void> {
  await prisma.transaction.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.message.deleteMany({})
  await prisma.messageThread.deleteMany({})
  await prisma.boostRecord.deleteMany({})
  await prisma.investment.deleteMany({})
  await prisma.bid.deleteMany({})
  await prisma.demandRequest.deleteMany({})
  await prisma.campaign.deleteMany({})
  await prisma.listing.deleteMany({})
  await prisma.cropDiagnosis.deleteMany({})
  await prisma.farm.deleteMany({})
  await prisma.subscription.deleteMany({})
  await prisma.profile.deleteMany({})
}

async function main(): Promise<void> {
  await wipe()
  const password = await bcrypt.hash(PASSWORD, 10)

  // ---- Admin ----
  await prisma.profile.create({
    data: {
      email: 'admin@farmlink.test',
      password,
      fullName: 'FarmLink Admin',
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
      trustScore: 90,
      createdAt: daysAgo(220),
    },
  })

  // ---- Farmers (each with a farm; real Ghana coords for the weather card) ----
  const farmerDefs = [
    { first: 'Kwabena Asante', email: 'kwabena.asante.demo@gmail.com', loc: 'Ejisu, Ashanti', lat: 6.69, lng: -1.36, trust: 82, kyc: 'VERIFIED', farm: 'Asante Family Farms', desc: 'Third-generation vegetable farm specialising in greenhouse tomatoes and peppers.', age: 180 },
    { first: 'Adwoa Mensah', email: 'adwoa.mensah.demo@gmail.com', loc: 'Techiman, Bono East', lat: 7.59, lng: -1.94, trust: 67, kyc: 'VERIFIED', farm: 'Mensah Organic Gardens', desc: 'Certified-organic maize and legumes across 12 acres.', age: 140 },
    { first: 'Yaw Boateng', email: 'yaw.boateng.demo@gmail.com', loc: 'Kumasi, Ashanti', lat: 6.69, lng: -1.62, trust: 74, kyc: 'VERIFIED', farm: 'Boateng Produce Co.', desc: 'Rice paddies and plantain, supplying Kumasi markets for 8 years.', age: 160 },
    { first: 'Akosua Darko', email: 'akosua.darko.demo@gmail.com', loc: 'Tamale, Northern', lat: 9.40, lng: -0.84, trust: 51, kyc: 'PENDING', farm: 'Darko Family Farm', desc: 'Yam, cowpea and sorghum on the northern plains.', age: 70 },
    { first: 'Kofi Owusu', email: 'kofi.owusu.demo@gmail.com', loc: 'Koforidua, Eastern', lat: 6.09, lng: -0.26, trust: 58, kyc: 'VERIFIED', farm: 'Owusu Greens', desc: 'Cocoa and pineapple smallholding in the Eastern Region.', age: 110 },
    { first: 'Kojo Antwi', email: 'kojo.antwi.demo@gmail.com', loc: 'Sunyani, Bono', lat: 7.34, lng: -2.33, trust: 39, kyc: 'PENDING', farm: 'Antwi Vegetables', desc: 'Onions, garden eggs and tomatoes for regional traders.', age: 40 },
  ]
  const farmers: { profileId: string; farmId: string; name: string }[] = []
  for (const f of farmerDefs) {
    const profile = await prisma.profile.create({
      data: {
        email: f.email, password, fullName: f.first, role: 'FARMER',
        location: f.loc, latitude: f.lat, longitude: f.lng,
        kycStatus: f.kyc, trustScore: f.trust, phone: '024' + Math.floor(1000000 + Math.random() * 8999999),
        createdAt: daysAgo(f.age),
      },
    })
    const farm = await prisma.farm.create({
      data: {
        farmerId: profile.id, name: f.farm, description: f.desc,
        location: f.loc, latitude: f.lat, longitude: f.lng, verified: f.kyc === 'VERIFIED',
        createdAt: daysAgo(f.age),
      },
    })
    farmers.push({ profileId: profile.id, farmId: farm.id, name: f.first })
  }

  // ---- Retailers ----
  const retailerDefs = [
    { first: 'Efua Boakye', email: 'efua.boakye.demo@gmail.com', loc: 'Makola Market, Accra', trust: 61 },
    { first: 'Nana Adjei', email: 'nana.adjei.demo@gmail.com', loc: 'Kumasi (restaurant group)', trust: 54 },
    { first: 'Abena Osei', email: 'abena.osei.demo@gmail.com', loc: 'Takoradi', trust: 46 },
    { first: 'Yaa Asantewaa', email: 'yaa.asantewaa.demo@gmail.com', loc: 'Tema (hotel sourcing)', trust: 70 },
  ]
  const retailers: { id: string; name: string }[] = []
  for (const r of retailerDefs) {
    const p = await prisma.profile.create({
      data: { email: r.email, password, fullName: r.first, role: 'RETAILER', location: r.loc, kycStatus: 'VERIFIED', trustScore: r.trust, createdAt: daysAgo(90) },
    })
    retailers.push({ id: p.id, name: r.first })
  }

  // ---- Investors ----
  const investorDefs = [
    { first: 'Selorm Kudjoe', email: 'selorm.kudjoe.demo@gmail.com', loc: 'Accra', trust: 42 },
    { first: 'Esi Quartey', email: 'esi.quartey.demo@gmail.com', loc: 'London (diaspora)', trust: 36 },
    { first: 'Fiifi Annan', email: 'fiifi.annan.demo@gmail.com', loc: 'Cape Coast', trust: 30 },
  ]
  const investors: { id: string; name: string }[] = []
  for (const inv of investorDefs) {
    const p = await prisma.profile.create({
      data: { email: inv.email, password, fullName: inv.first, role: 'INVESTOR', location: inv.loc, kycStatus: 'VERIFIED', trustScore: inv.trust, createdAt: daysAgo(60) },
    })
    investors.push({ id: p.id, name: inv.first })
  }

  // ---- Listings (varied crops/categories/prices; one boosted) ----
  const listingDefs = [
    { fi: 0, crop: 'Tomatoes', category: 'vegetables', qty: 1200, price: 6.5, boost: true },
    { fi: 0, crop: 'Green Pepper', category: 'vegetables', qty: 400, price: 9.0 },
    { fi: 1, crop: 'Maize', category: 'grains', qty: 5000, price: 3.2 },
    { fi: 1, crop: 'Cowpea', category: 'legumes', qty: 800, price: 7.5 },
    { fi: 2, crop: 'Rice', category: 'grains', qty: 3000, price: 8.0 },
    { fi: 2, crop: 'Plantain', category: 'fruits', qty: 1500, price: 4.2 },
    { fi: 3, crop: 'Yam', category: 'roots', qty: 2000, price: 5.5 },
    { fi: 3, crop: 'Sorghum', category: 'grains', qty: 1000, price: 4.0 },
    { fi: 4, crop: 'Cocoa', category: 'cash', qty: 900, price: 12.0 },
    { fi: 4, crop: 'Pineapple', category: 'fruits', qty: 1100, price: 3.8 },
    { fi: 5, crop: 'Onions', category: 'vegetables', qty: 1300, price: 6.0 },
    { fi: 5, crop: 'Garden Eggs', category: 'vegetables', qty: 600, price: 5.2 },
  ]
  const listings: { id: string; fi: number; crop: string; price: number }[] = []
  for (const l of listingDefs) {
    const listing = await prisma.listing.create({
      data: {
        farmId: farmers[l.fi].farmId, crop: l.crop, category: l.category,
        quantityKg: l.qty, pricePerKg: l.price, status: 'ACTIVE',
        harvestDate: daysAhead(20 + Math.floor(Math.random() * 40)),
        createdAt: daysAgo(1 + Math.floor(Math.random() * 12)),
      },
    })
    listings.push({ id: listing.id, fi: l.fi, crop: l.crop, price: l.price })
    if (l.boost) {
      await prisma.boostRecord.create({
        data: {
          userId: farmers[l.fi].profileId, targetType: 'listing', targetId: listing.id,
          priceGhs: 20, startsAt: daysAgo(1), expiresAt: daysAhead(6), active: true, paystackReference: ref(),
        },
      })
    }
  }

  // ---- Campaigns + investments ----
  // ACTIVE (partly funded)
  const c1 = await prisma.campaign.create({
    data: {
      farmId: farmers[0].farmId, crop: 'Greenhouse Tomatoes', status: 'ACTIVE',
      description: 'Funding two new greenhouses to triple dry-season tomato yield and supply Accra hotels year-round.',
      targetAmount: 8000, raisedAmount: 3100, profitSharePct: 25, harvestDate: daysAhead(95), createdAt: daysAgo(20),
    },
  })
  // FUNDED
  const c2 = await prisma.campaign.create({
    data: {
      farmId: farmers[1].farmId, crop: 'Organic Maize', status: 'FUNDED',
      description: 'A full organic maize season across 12 acres — inputs, labour and storage for a verified harvest.',
      targetAmount: 5000, raisedAmount: 5000, profitSharePct: 20, harvestDate: daysAhead(55), createdAt: daysAgo(45),
    },
  })
  // HARVESTED
  const c3 = await prisma.campaign.create({
    data: {
      farmId: farmers[2].farmId, crop: 'Rice Paddy', status: 'HARVESTED',
      description: 'Expanding the rice paddy by 6 acres; harvest delivered to Kumasi aggregators.',
      targetAmount: 6000, raisedAmount: 6000, profitSharePct: 22, harvestDate: daysAgo(8), createdAt: daysAgo(120),
    },
  })
  const invest = async (campaignId: string, investorId: string, amount: number, target: number, share: number, status = 'ACTIVE'): Promise<void> => {
    await prisma.investment.create({
      data: { campaignId, investorId, amount, sharePct: round2((amount / target) * share), status },
    })
  }
  await invest(c1.id, investors[0].id, 2000, 8000, 25)
  await invest(c1.id, investors[1].id, 1100, 8000, 25)
  await invest(c2.id, investors[0].id, 2500, 5000, 20)
  await invest(c2.id, investors[2].id, 1500, 5000, 20)
  await invest(c2.id, investors[1].id, 1000, 5000, 20)
  await invest(c3.id, investors[2].id, 6000, 6000, 22, 'PAID_OUT')

  // ---- Demand requests + bids ----
  // AWARDED (accepted bid, no payment yet → "Pay now" demoable)
  const d1 = await prisma.demandRequest.create({
    data: { retailerId: retailers[0].id, crop: 'Tomatoes', quantityKg: 500, maxPricePerKg: 6.5, deliveryLocation: 'Makola Market, Accra', neededBy: daysAhead(12), status: 'AWARDED', createdAt: daysAgo(6) },
  })
  await prisma.bid.create({ data: { demandId: d1.id, farmerId: farmers[0].profileId, offeredPrice: 6.0, message: 'Fresh harvest, can deliver in 3 days.', status: 'ACCEPTED' } })
  await prisma.bid.create({ data: { demandId: d1.id, farmerId: farmers[5].profileId, offeredPrice: 6.4, status: 'REJECTED' } })
  // BIDDING (pending bids)
  const d2 = await prisma.demandRequest.create({
    data: { retailerId: retailers[1].id, crop: 'Onions', quantityKg: 300, maxPricePerKg: 7.0, deliveryLocation: 'Kumasi', neededBy: daysAhead(18), status: 'BIDDING', createdAt: daysAgo(3) },
  })
  await prisma.bid.create({ data: { demandId: d2.id, farmerId: farmers[5].profileId, offeredPrice: 6.2, message: 'Bulk discount available.', status: 'PENDING' } })
  await prisma.bid.create({ data: { demandId: d2.id, farmerId: farmers[3].profileId, offeredPrice: 6.8, status: 'PENDING' } })
  // OPEN + BIDDING others
  await prisma.demandRequest.create({
    data: { retailerId: retailers[2].id, crop: 'Maize', quantityKg: 1000, maxPricePerKg: 3.5, deliveryLocation: 'Takoradi', neededBy: daysAhead(25), status: 'OPEN', createdAt: daysAgo(2) },
  })
  const d4 = await prisma.demandRequest.create({
    data: { retailerId: retailers[3].id, crop: 'Green Pepper', quantityKg: 200, maxPricePerKg: 9.0, deliveryLocation: 'Tema', neededBy: daysAhead(10), status: 'BIDDING', createdAt: daysAgo(4) },
  })
  await prisma.bid.create({ data: { demandId: d4.id, farmerId: farmers[0].profileId, offeredPrice: 8.5, status: 'PENDING' } })

  // ---- Transactions (escrow lifecycle: RELEASED x2, HELD, DISPUTED) ----
  const tx = async (
    buyerId: string, sellerId: string, listingId: string, crop: string, qty: number, price: number,
    escrowStatus: string, ageDays: number
  ): Promise<void> => {
    const amount = round2(qty * price)
    await prisma.transaction.create({
      data: {
        type: 'MARKETPLACE', buyerId, sellerId, listingId, crop, quantityKg: qty,
        amount, platformFee: round2(amount * (FEE_PCT / 100)),
        paystackReference: ref(), escrowStatus, createdAt: daysAgo(ageDays),
      },
    })
  }
  await tx(retailers[0].id, farmers[1].profileId, listings[2].id, 'Maize', 300, 3.2, 'RELEASED', 22)
  await tx(retailers[3].id, farmers[2].profileId, listings[4].id, 'Rice', 250, 8.0, 'RELEASED', 15)
  await tx(retailers[1].id, farmers[0].profileId, listings[0].id, 'Tomatoes', 120, 6.5, 'HELD', 3)
  await tx(retailers[2].id, farmers[4].profileId, listings[8].id, 'Cocoa', 60, 12.0, 'DISPUTED', 9)

  // ---- Message thread + notifications (so the bell + messages page look alive) ----
  const thread = await prisma.messageThread.create({
    data: { participantIds: [retailers[0].id, farmers[0].profileId], contextType: 'listing', contextId: listings[0].id },
  })
  await prisma.message.create({ data: { threadId: thread.id, senderId: retailers[0].id, content: 'Hi Kwabena — are the tomatoes available for weekly supply?', read: true, createdAt: daysAgo(2) } })
  await prisma.message.create({ data: { threadId: thread.id, senderId: farmers[0].profileId, content: 'Yes! I can do 500kg/week at GH₵6. Let’s set it up.', read: false, createdAt: daysAgo(2) } })

  const notify = (userId: string, type: string, title: string, body: string, actionUrl: string, ageDays: number) =>
    prisma.notification.create({ data: { userId, type, title, body, actionUrl, read: false, createdAt: daysAgo(ageDays) } })
  await notify(farmers[0].profileId, 'NEW_BID', 'Your bid was accepted', 'Efua Boakye accepted your bid on 500kg Tomatoes.', '/dashboard/demands', 6)
  await notify(farmers[1].profileId, 'CAMPAIGN_FUNDED', 'Campaign fully funded 🎉', 'Your Organic Maize campaign reached its GH₵5,000 target.', '/dashboard/campaigns', 5)
  await notify(farmers[1].profileId, 'PAYMENT_RELEASED', 'Payment released', 'GH₵960 was released to you for a Maize order.', '/dashboard/orders', 22)
  await notify(retailers[0].id, 'NEW_MESSAGE', 'New message from Kwabena Asante', 'Yes! I can do 500kg/week at GH₵6…', `/dashboard/messages?t=${thread.id}`, 2)

  console.log('Demo data seeded. Login with password "demo1234".')
  console.log(`  Farmers ${farmers.length} · Retailers ${retailers.length} · Investors ${investors.length}`)
  console.log(`  Listings ${listings.length} (1 boosted) · Campaigns 3 · Demands 4 · Transactions 4 (incl. 1 disputed)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
