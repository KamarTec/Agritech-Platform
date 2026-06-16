/**
 * Generates FarmLink_Pitch.pptx — a branded, editable pitch deck.
 * Run:  cd docs/pitch && npm install && node generate-deck.js
 * Drop your own screenshots into the dashed "[Screenshot: …]" boxes.
 * Every slide has speaker notes (View > Notes).
 */
const path = require('path')
const PptxGenJS = require('pptxgenjs')

const pptx = new PptxGenJS()
pptx.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 in
pptx.author = 'FarmLink'
pptx.company = 'FarmLink'
pptx.title = 'FarmLink — Pitch'

// ---- Brand ----
const C = {
  forest: '0A1F12',
  deep: '14532D',
  green: '16A34A',
  greenLt: 'DCFCE7',
  amber: 'F59E0B',
  ink: '1F2937',
  grey: '6B7280',
  line: 'E5E7EB',
  white: 'FFFFFF',
}
const FONT = 'Calibri'
const LOGO = path.join(__dirname, '..', '..', 'apps', 'web', 'public', 'farmlink-logo.png')
const W = 13.33

// ---- Helpers ----
function contentSlide(titleText, kicker) {
  const s = pptx.addSlide()
  s.background = { color: C.white }
  s.addImage({ path: LOGO, x: 11.55, y: 0.3, w: 1.5, h: 0.67 })
  if (kicker) {
    s.addText(kicker.toUpperCase(), { x: 0.6, y: 0.42, w: 9, h: 0.3, fontFace: FONT, fontSize: 11, color: C.green, bold: true, charSpacing: 2 })
  }
  s.addText(titleText, { x: 0.6, y: kicker ? 0.72 : 0.5, w: 10.6, h: 0.7, fontFace: FONT, fontSize: 26, bold: true, color: C.deep })
  s.addShape(pptx.ShapeType.line, { x: 0.6, y: kicker ? 1.5 : 1.3, w: 12.1, h: 0, line: { color: C.green, width: 2 } })
  s.addText('FarmLink · Ghana · 2026', { x: 0.6, y: 7.05, w: 6, h: 0.3, fontFace: FONT, fontSize: 9, color: C.grey })
  return s
}

function bullets(items) {
  return items.map((t) => ({ text: t, options: { bullet: { code: '2022' }, fontFace: FONT, fontSize: 15, color: C.ink, paraSpaceAfter: 8, indentLevel: 0 } }))
}

function statTile(s, x, y, w, big, label, color = C.green) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 1.45, rectRadius: 0.08, fill: { color: C.greenLt }, line: { color: color, width: 1 } })
  s.addText(big, { x, y: y + 0.12, w, h: 0.7, align: 'center', fontFace: FONT, fontSize: 30, bold: true, color: C.deep })
  s.addText(label, { x: x + 0.1, y: y + 0.82, w: w - 0.2, h: 0.55, align: 'center', fontFace: FONT, fontSize: 11.5, color: C.ink })
}

function placeholder(s, x, y, w, h, label) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: 'F3F4F6' }, line: { color: C.green, width: 1.25, dashType: 'dash' } })
  s.addText(`📷  ${label}`, { x, y: y + h / 2 - 0.3, w, h: 0.6, align: 'center', fontFace: FONT, fontSize: 13, italic: true, color: C.grey })
}

// =========================================================
// 1 — TITLE
// =========================================================
{
  const s = pptx.addSlide()
  s.background = { color: C.forest }
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.18, fill: { color: C.green } })
  s.addImage({ path: LOGO, x: 5.4, y: 1.5, w: 2.53, h: 1.14 })
  s.addText('Trade. Invest. Grow.', { x: 0, y: 3.0, w: W, h: 0.8, align: 'center', fontFace: FONT, fontSize: 40, bold: true, color: C.white })
  s.addText("Ghana's all-in-one farm-trade & investment platform", { x: 0, y: 3.9, w: W, h: 0.5, align: 'center', fontFace: FONT, fontSize: 18, color: C.greenLt })
  s.addText('Direct marketplace  ·  Escrow trust  ·  Harvest investing  ·  AI Crop Doctor', { x: 0, y: 4.5, w: W, h: 0.4, align: 'center', fontFace: FONT, fontSize: 13, color: 'A7F3D0' })
  s.addText('Team of 10  ·  Ghana  ·  2026', { x: 0, y: 6.6, w: W, h: 0.4, align: 'center', fontFace: FONT, fontSize: 12, color: C.greenLt })
  s.addNotes('Hook: Ghana grows the food but the people who grow it earn the least. We built FarmLink so farmers, buyers and everyday investors can trade and grow together — with trust built in. 10-second intro, then go to the problem.')
}

// =========================================================
// 2 — PROBLEM
// =========================================================
{
  const s = contentSlide('A broken, low-trust farm economy', 'The problem')
  s.addText(bullets([
    'Middlemen capture most of the margin — farmers sell low, buyers pay high.',
    'No price transparency and heavy post-harvest losses — farmers guess at fair prices.',
    'Farmers can’t access harvest financing; banks treat smallholders as too risky.',
    'Buyers and investors fear fraud — there’s no trust layer and no recourse.',
  ]), { x: 0.6, y: 1.8, w: 7.4, h: 3.5, valign: 'top' })
  s.addShape(pptx.ShapeType.roundRect, { x: 8.3, y: 1.9, w: 4.4, h: 3.0, rectRadius: 0.08, fill: { color: C.greenLt }, line: { color: C.amber, width: 1.5 } })
  s.addText('GH₵38.9bn', { x: 8.3, y: 2.2, w: 4.4, h: 0.8, align: 'center', fontFace: FONT, fontSize: 36, bold: true, color: C.deep })
  s.addText('(~US$2bn) of food imported into Ghana in 2024 — while local farmers struggle to reach buyers.', { x: 8.5, y: 3.0, w: 4.0, h: 1.5, align: 'center', fontFace: FONT, fontSize: 13, color: C.ink })
  s.addText('Source: Ghana Statistical Service, 2024 trade report.', { x: 0.6, y: 6.6, w: 8, h: 0.3, fontFace: FONT, fontSize: 9, italic: true, color: C.grey })
  s.addNotes('Tell one concrete story (a tomato farmer dumping unsold crop while Accora hotels import paste). Then the GH₵38.9bn import bill: the demand is here, the chain is just broken and untrusted.')
}

// =========================================================
// 3 — SURVEY VALIDATION (placeholders)
// =========================================================
{
  const s = contentSlide('We heard it straight from the field', 'Validation')
  s.addText('Replace the brackets with your real survey results before presenting.', { x: 0.6, y: 1.7, w: 12, h: 0.4, fontFace: FONT, fontSize: 12, italic: true, color: C.grey })
  statTile(s, 0.7, 2.4, 3.8, '[__%]', 'of farmers say middlemen cut their income')
  statTile(s, 4.75, 2.4, 3.8, '[__%]', 'would sell online if payment were escrow-protected', C.amber)
  statTile(s, 8.8, 2.4, 3.8, '[__%]', 'of buyers worried about fraud / quality when sourcing')
  s.addText(bullets([
    'Sample: [__] respondents across [regions] — farmers, retailers and investors.',
    'Top request: [paste the #1 thing respondents asked for].',
  ]), { x: 0.7, y: 4.2, w: 12, h: 1.6, valign: 'top' })
  s.addNotes('Swap the [__] tiles for your real survey numbers and N. Keep it to 3 punchy stats + the sample size. If you have a standout quote, read it verbatim — judges remember voices.')
}

// =========================================================
// 4 — SOLUTION
// =========================================================
{
  const s = contentSlide('One trusted platform for the whole chain', 'The solution')
  const pillars = [
    ['🛒  Direct marketplace + escrow', 'Farmers list produce; buyers order with payment held in escrow until delivery is confirmed. Trade without fear of fraud.'],
    ['📣  Reverse demand auctions', 'Retailers post what they need; farmers bid to supply. The buyer picks the best offer — then pays into escrow.'],
    ['🌱  Harvest investing from GH₵100', 'Anyone can fund a real harvest campaign and earn a share of the profit from verified farms.'],
    ['🤖  AI Crop Doctor + Trust Scores', 'Free AI crop diagnosis, automatic Trust Scores, KYC badges and regional price intelligence.'],
  ]
  let y = 1.8
  for (let i = 0; i < pillars.length; i++) {
    const col = i % 2, row = Math.floor(i / 2)
    const x = 0.6 + col * 6.15
    const yy = 1.8 + row * 2.45
    s.addShape(pptx.ShapeType.roundRect, { x, y: yy, w: 5.9, h: 2.2, rectRadius: 0.08, fill: { color: 'F8FAF9' }, line: { color: C.line, width: 1 } })
    s.addText(pillars[i][0], { x: x + 0.25, y: yy + 0.2, w: 5.4, h: 0.5, fontFace: FONT, fontSize: 16, bold: true, color: C.deep })
    s.addText(pillars[i][1], { x: x + 0.25, y: yy + 0.8, w: 5.4, h: 1.3, fontFace: FONT, fontSize: 13, color: C.ink, valign: 'top' })
  }
  s.addText('The only platform in Ghana combining direct trade, harvest investment, AI diagnosis & escrow.', { x: 0.6, y: 6.75, w: 12, h: 0.4, align: 'center', fontFace: FONT, fontSize: 13, bold: true, color: C.green })
  s.addNotes('This is the heart of the pitch and maps directly to the BMC value propositions. Land the one-liner at the bottom — it is our differentiator.')
}

// =========================================================
// 5 — HOW IT WORKS
// =========================================================
{
  const s = contentSlide('How it works', 'Product')
  const cols = [
    ['👩‍🌾 Farmer', ['List produce or launch a harvest campaign', 'Receive orders & bids; get paid via escrow', 'Build a Trust Score with every completed deal']],
    ['🏪 Retailer', ['Browse the marketplace or post a demand', 'Compare farmer bids and accept the best', 'Pay into escrow; release on delivery']],
    ['💼 Investor', ['Browse verified harvest campaigns', 'Invest from GH₵100; track your portfolio', 'Earn a profit share at harvest']],
  ]
  for (let i = 0; i < cols.length; i++) {
    const x = 0.6 + i * 4.15
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.9, w: 3.9, h: 3.9, rectRadius: 0.08, fill: { color: 'F8FAF9' }, line: { color: C.green, width: 1.25 } })
    s.addText(cols[i][0], { x, y: 2.1, w: 3.9, h: 0.5, align: 'center', fontFace: FONT, fontSize: 17, bold: true, color: C.deep })
    s.addText(cols[i][1].map((t, idx) => ({ text: `${idx + 1}.  ${t}`, options: { fontFace: FONT, fontSize: 13, color: C.ink, paraSpaceAfter: 12 } })), { x: x + 0.25, y: 2.7, w: 3.45, h: 2.9, valign: 'top' })
  }
  s.addText('🛡️  Escrow + Trust Scores run underneath all three — that’s the trust spine.', { x: 0.6, y: 6.1, w: 12, h: 0.4, align: 'center', fontFace: FONT, fontSize: 13, bold: true, color: C.green })
  s.addNotes('Walk one path end-to-end (retailer posts demand → farmer bids → escrow → delivery → Trust Score up). Keep it concrete.')
}

// =========================================================
// 6 — PRODUCT (LIVE) — MARKETPLACE
// =========================================================
{
  const s = contentSlide('It’s live — the marketplace & escrow', 'Product (built)')
  placeholder(s, 0.6, 1.8, 7.6, 4.7, '[Screenshot: Marketplace grid + an escrow order modal]')
  s.addText(bullets([
    'Browse by crop & category',
    'Verified farms, Trust badges',
    'Order → pay via Paystack',
    'Money held in escrow until delivery',
    '“Boosted” listings rank on top',
  ]), { x: 8.5, y: 2.0, w: 4.2, h: 4.2, valign: 'top' })
  s.addNotes('Show the real deployed app. If doing a live demo, log in as the retailer (efua.boakye.demo@gmail.com / demo1234) and open the marketplace.')
}

// =========================================================
// 7 — PRODUCT (LIVE) — THE REST
// =========================================================
{
  const s = contentSlide('Demand auctions · Investing · AI · Admin', 'Product (built)')
  placeholder(s, 0.6, 1.8, 6.0, 2.3, '[Screenshot: Demand request + farmer bids]')
  placeholder(s, 6.8, 1.8, 5.9, 2.3, '[Screenshot: Harvest campaign + investor portfolio]')
  placeholder(s, 0.6, 4.25, 6.0, 2.3, '[Screenshot: AI Crop Doctor diagnosis]')
  placeholder(s, 6.8, 4.25, 5.9, 2.3, '[Screenshot: Admin dashboard — disputes / KYC / metrics]')
  s.addNotes('Four screenshots covering the breadth. The admin/dispute screen proves we thought about trust & operations — judges love operational maturity.')
}

// =========================================================
// 8 — MARKET
// =========================================================
{
  const s = contentSlide('A large, underserved market', 'Opportunity')
  const tiers = [
    ['TAM', 'Ghana agriculture', 'Agriculture ≈ 21% of GDP and ≈ 33% of jobs; ~US$2bn food imported yearly — a huge local-sourcing gap.', C.deep],
    ['SAM', 'Digitally reachable', 'Smallholders (65% of farms < 2 ha), retailers, food traders, hotels & a growing base of retail investors with mobile money.', C.green],
    ['SOM', 'Year-1 beachhead', 'Target 10,000 farmers + 2,500 buyers across Ashanti, Bono & Greater Accra in the first 12 months.', C.amber],
  ]
  let y = 1.9
  for (const [tag, head, body, color] of tiers) {
    s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y, w: 1.5, h: 1.4, rectRadius: 0.08, fill: { color }, line: { color, width: 1 } })
    s.addText(tag, { x: 0.6, y: y + 0.45, w: 1.5, h: 0.5, align: 'center', fontFace: FONT, fontSize: 20, bold: true, color: C.white })
    s.addText(head, { x: 2.35, y: y + 0.1, w: 10.3, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: C.deep })
    s.addText(body, { x: 2.35, y: y + 0.55, w: 10.3, h: 0.85, fontFace: FONT, fontSize: 13, color: C.ink, valign: 'top' })
    y += 1.6
  }
  s.addText('Sources: Oxford Business Group / FAO (GDP & employment); Ghana Statistical Service 2024 (imports).', { x: 0.6, y: 6.8, w: 12, h: 0.3, fontFace: FONT, fontSize: 9, italic: true, color: C.grey })
  s.addNotes('Don’t overclaim the SOM — frame it as a focused beachhead we can actually capture, then expand. Numbers are public and cited.')
}

// =========================================================
// 9 — BUSINESS MODEL
// =========================================================
{
  const s = contentSlide('How we make money', 'Business model')
  s.addText(bullets([
    'Transaction fees: 2.5% on produce sales · 3% on funded harvest campaigns · 0.5% escrow fee',
    'Subscriptions: Farmer Pro GH₵49 · Retailer Pro GH₵79 · Investor Pro GH₵99 · Business GH₵199 / month',
    'Boosted listings & promoted campaigns: GH₵20–150',
    'Supplier marketplace & group-buy commissions: 2%',
    'Later: insurance-pool fee (10%), loan-referral fees, B2B market-data reports',
  ]), { x: 0.6, y: 1.8, w: 7.5, h: 4.0, valign: 'top' })
  s.addShape(pptx.ShapeType.roundRect, { x: 8.4, y: 1.9, w: 4.3, h: 3.9, rectRadius: 0.08, fill: { color: C.greenLt }, line: { color: C.green, width: 1.25 } })
  s.addText('Unit economics', { x: 8.4, y: 2.1, w: 4.3, h: 0.4, align: 'center', fontFace: FONT, fontSize: 15, bold: true, color: C.deep })
  s.addText([
    { text: 'A GH₵3,000 produce order', options: { fontFace: FONT, fontSize: 12, color: C.grey, paraSpaceAfter: 2 } },
    { text: '→ ~GH₵90 to FarmLink', options: { fontFace: FONT, fontSize: 15, bold: true, color: C.deep, paraSpaceAfter: 14 } },
    { text: 'A GH₵5,000 funded campaign', options: { fontFace: FONT, fontSize: 12, color: C.grey, paraSpaceAfter: 2 } },
    { text: '→ GH₵150 to FarmLink', options: { fontFace: FONT, fontSize: 15, bold: true, color: C.deep, paraSpaceAfter: 14 } },
    { text: '+ recurring subscriptions on top', options: { fontFace: FONT, fontSize: 12, italic: true, color: C.ink } },
  ], { x: 8.6, y: 2.55, w: 3.9, h: 3.1, valign: 'top' })
  s.addText('Mirrors the Business Model Canvas revenue streams.', { x: 0.6, y: 6.75, w: 12, h: 0.3, fontFace: FONT, fontSize: 10, italic: true, color: C.grey })
  s.addNotes('Lead with the take-rate (already implemented in the product). Subscriptions and boosts are upside. Every number here is on the BMC.')
}

// =========================================================
// 10 — COMPETITION
// =========================================================
{
  const s = contentSlide('Why FarmLink wins', 'Competition')
  const Y = '✓', N = '—'
  const head = ['Capability', 'FarmLink', 'Esoko', 'Farmerline', 'AgroCenta', 'Complete Farmer', 'ThriveAgric'].map((t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.deep }, fontSize: 10, align: 'center' } }))
  const rowsDef = [
    ['Direct marketplace', Y, N, N, Y, Y, N],
    ['Escrow-protected pay', Y, N, N, N, N, N],
    ['Reverse demand auctions', Y, N, N, N, N, N],
    ['Public harvest investing', Y, N, N, N, '~', '~'],
    ['AI crop diagnosis', Y, N, N, N, N, N],
    ['Trust score / verification', Y, N, N, '~', '~', '~'],
    ['Price intelligence', Y, Y, Y, Y, N, N],
    ['Ghana consumer-facing', Y, Y, Y, Y, '~', N],
  ]
  const body = rowsDef.map((r) => r.map((cell, i) => ({
    text: cell,
    options: {
      fontSize: 10, align: i === 0 ? 'left' : 'center', bold: i === 1,
      color: i === 0 ? C.ink : cell === Y ? '15803D' : cell === '~' ? 'B45309' : C.grey,
      fill: { color: i === 1 ? C.greenLt : C.white },
    },
  })))
  s.addTable([head, ...body], { x: 0.5, y: 1.7, w: 12.3, colW: [3.0, 1.55, 1.35, 1.55, 1.55, 1.95, 1.35], rowH: 0.42, border: { type: 'solid', color: C.line, pt: 0.5 }, valign: 'middle', fontFace: FONT })
  s.addText('Public agri-crowdfunding in Africa collapsed on trust (ThriveAgric & Farmcrowdy retreated to institutional). FarmLink is built trust-first — escrow + Trust Scores + KYC.', { x: 0.5, y: 6.5, w: 12.3, h: 0.6, align: 'center', fontFace: FONT, fontSize: 12.5, bold: true, color: C.green })
  s.addNotes('Don’t trash competitors — credit them (Esoko/Farmerline reach millions with info). Our wedge: we combine trade + investment + AI behind one trust layer. The crowdfunding-collapse point is the killer line.')
}

// =========================================================
// 11 — TRACTION
// =========================================================
{
  const s = contentSlide('A working product — not slideware', 'Traction')
  s.addText(bullets([
    'Full platform built & deployed (web app + API + database) — live today.',
    'Every flow shipped: marketplace, escrow, demand auctions, harvest campaigns, AI Crop Doctor, messaging, trust scores, admin.',
    'Real payments via Paystack escrow; AI diagnosis via Google Gemini.',
    'Subscriptions, boosted listings & price intelligence already in-product.',
  ]), { x: 0.6, y: 1.8, w: 6.6, h: 4.2, valign: 'top' })
  placeholder(s, 7.5, 1.9, 5.2, 4.3, '[Screenshot: Dashboard overview with live stats]')
  s.addText('Live demo: [your deployed URL]  ·  Demo login on request', { x: 0.6, y: 6.6, w: 9, h: 0.3, fontFace: FONT, fontSize: 10, italic: true, color: C.grey })
  s.addNotes('This is our unfair advantage vs other student teams: a real, usable product. Offer a 60-second live demo if time allows. Fill in the deployed URL.')
}

// =========================================================
// 12 — GO TO MARKET
// =========================================================
{
  const s = contentSlide('Go-to-market', 'Growth')
  s.addText('Channels (from our canvas)', { x: 0.6, y: 1.8, w: 6, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.deep })
  s.addText(bullets([
    'Farmer cooperatives & market associations',
    'Radio adverts in farming regions',
    'WhatsApp, TikTok, Facebook & Instagram',
    'Posters at agro-shops & market centres',
    'Field onboarding + referral rewards',
  ]), { x: 0.6, y: 2.3, w: 6, h: 3.5, valign: 'top' })
  s.addText('Phased rollout', { x: 7.0, y: 1.8, w: 6, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.deep })
  const phases = [
    ['Phase 1 (0–6 mo)', 'Pilot in Ashanti & Bono — onboard cooperatives, prove the loop.'],
    ['Phase 2 (6–12 mo)', 'Expand to Northern & Greater Accra; activate investors.'],
    ['Phase 3 (12 mo+)', 'National + mobile/USSD app; supplier marketplace & group buying.'],
  ]
  let y = 2.3
  for (const [h, b] of phases) {
    s.addText(h, { x: 7.0, y, w: 5.7, h: 0.35, fontFace: FONT, fontSize: 13.5, bold: true, color: C.green })
    s.addText(b, { x: 7.0, y: y + 0.35, w: 5.7, h: 0.7, fontFace: FONT, fontSize: 12.5, color: C.ink, valign: 'top' })
    y += 1.2
  }
  s.addNotes('Channels are straight from the BMC. Stress the cooperative + radio play — that’s how you reach rural farmers cheaply.')
}

// =========================================================
// 13 — FINANCIALS
// =========================================================
{
  const s = contentSlide('Illustrative projections', 'Financials')
  const head = ['', 'Year 1', 'Year 2', 'Year 3'].map((t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.deep }, fontSize: 13, align: 'center' } }))
  const rows = [
    ['Active farmers', '1,500', '8,000', '25,000'],
    ['GMV (GH₵)', '2.5M', '14M', '45M'],
    ['Revenue (GH₵)', '180k', '850k', '2.6M'],
  ]
  const body = rows.map((r) => r.map((cell, i) => ({ text: cell, options: { fontSize: 13, align: i === 0 ? 'left' : 'center', bold: i === 0, color: C.ink, fill: { color: i === 0 ? C.greenLt : C.white } } })))
  s.addTable([head, ...body], { x: 0.6, y: 1.9, w: 9.2, colW: [3.2, 2.0, 2.0, 2.0], rowH: 0.6, border: { type: 'solid', color: C.line, pt: 0.5 }, valign: 'middle', fontFace: FONT })
  s.addShape(pptx.ShapeType.roundRect, { x: 10.1, y: 1.9, w: 2.6, h: 2.4, rectRadius: 0.08, fill: { color: C.greenLt }, line: { color: C.amber, width: 1.5 } })
  s.addText('Break-even', { x: 10.1, y: 2.2, w: 2.6, h: 0.4, align: 'center', fontFace: FONT, fontSize: 13, bold: true, color: C.deep })
  s.addText('~ mid Year 2', { x: 10.1, y: 2.7, w: 2.6, h: 0.5, align: 'center', fontFace: FONT, fontSize: 17, bold: true, color: C.green })
  s.addText('on a ~GH₵118k/yr base cost', { x: 10.1, y: 3.3, w: 2.6, h: 0.8, align: 'center', fontFace: FONT, fontSize: 11, color: C.ink })
  s.addText('Illustrative. Assumptions: 3% blended take-rate + subscriptions; costs from our BMC (team + infra). Detail in speaker notes.', { x: 0.6, y: 4.7, w: 12, h: 0.5, fontFace: FONT, fontSize: 11, italic: true, color: C.grey })
  s.addNotes('Assumptions: GMV grows with farmer count; revenue = ~3% of GMV + subscriptions + boosts. Base cost from BMC: staff GH₵8,600/mo + infra GH₵1,200/mo ≈ GH₵118k/yr. These are planning estimates, clearly labelled illustrative — say so if asked.')
}

// =========================================================
// 14 — ROADMAP
// =========================================================
{
  const s = contentSlide('What’s next', 'Roadmap')
  s.addText(bullets([
    'KYC verification at scale → more verified farms & investor confidence',
    'Mobile & USSD app — reach farmers without smartphones',
    'Crop insurance pool — protect farmers & investors against loss',
    'Group buying for inputs — cheaper seeds & fertiliser together',
    'Supplier marketplace & B2B market-data reports',
    'Expansion to new regions, then neighbouring markets',
  ]), { x: 0.6, y: 1.9, w: 12, h: 4.5, valign: 'top' })
  s.addNotes('Frame the roadmap as deepening the trust + financing moat, not feature creep. Insurance + group buying directly serve the BMC segments.')
}

// =========================================================
// 15 — TEAM + ASK
// =========================================================
{
  const s = contentSlide('Team & the ask', 'Join us')
  s.addText('A 10-person team across product, engineering, agronomy & growth.', { x: 0.6, y: 1.75, w: 12, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: C.deep })
  s.addText('[Add the 10 names + roles + photos here]', { x: 0.6, y: 2.15, w: 7.4, h: 0.4, fontFace: FONT, fontSize: 11, italic: true, color: C.grey })
  s.addShape(pptx.ShapeType.roundRect, { x: 8.3, y: 2.0, w: 4.4, h: 4.3, rectRadius: 0.08, fill: { color: C.forest } })
  s.addText('The ask', { x: 8.3, y: 2.2, w: 4.4, h: 0.4, align: 'center', fontFace: FONT, fontSize: 14, bold: true, color: 'A7F3D0' })
  s.addText('GH₵250,000', { x: 8.3, y: 2.6, w: 4.4, h: 0.7, align: 'center', fontFace: FONT, fontSize: 32, bold: true, color: C.white })
  s.addText('pre-seed + pilot partners', { x: 8.3, y: 3.3, w: 4.4, h: 0.4, align: 'center', fontFace: FONT, fontSize: 13, color: C.greenLt })
  s.addText([
    { text: '12-month runway:', options: { fontFace: FONT, fontSize: 11.5, bold: true, color: C.white, paraSpaceAfter: 4 } },
    { text: 'Team GH₵103k · Infra & AI GH₵14k · Marketing & onboarding GH₵42k · Equipment GH₵39k · Legal + buffer GH₵52k', options: { fontFace: FONT, fontSize: 10.5, color: C.greenLt, paraSpaceAfter: 8 } },
    { text: 'Buys: 10,000 farmers onboarded in 3 regions and a clear line to break-even.', options: { fontFace: FONT, fontSize: 11, italic: true, color: 'A7F3D0' } },
  ], { x: 8.55, y: 3.8, w: 3.9, h: 2.4, valign: 'top' })
  s.addText(bullets([
    'A working product, live today',
    'A clear, trust-first wedge competitors lack',
    'Revenue model already built into the platform',
    'A focused, executing team of 10',
  ]), { x: 0.6, y: 2.8, w: 7.3, h: 3.4, valign: 'top' })
  s.addNotes('The ask number is derived from our BMC cost structure, so it self-justifies — walk the breakdown: 12 months of runway + onboarding + one-time equipment + buffer = GH₵250k, and state exactly what it buys (10k farmers, 3 regions, break-even in sight). Close on the vision: the trusted backbone of Ghana’s farm economy.')
}

// =========================================================
// 16 — APPENDIX: BMC
// =========================================================
{
  const s = contentSlide('Appendix — Business Model Canvas', 'Reference')
  const blocks = [
    ['Key Partners', 'Paystack · Google (Gemini) · cooperatives · agro-input suppliers · banks/MFIs · logistics · Africa’s Talking'],
    ['Key Activities', 'Platform dev · onboarding & KYC · escrow & disputes · campaigns · marketing · partnerships'],
    ['Value Props', 'Direct trade + escrow · demand auctions · harvest investing from GH₵100 · AI diagnosis · Trust Scores'],
    ['Customer Relationships', 'Self-service + in-app support · Trust Scores · SMS/email/in-app · community · referrals'],
    ['Customer Segments', 'Farmers · retailers/traders/hotels · individual investors · agro-input suppliers'],
    ['Key Resources', 'The platform · team · cloud infra · verified network · escrow & brand trust'],
    ['Channels', 'Web & mobile · social · radio · cooperatives & markets · agro-shops'],
    ['Cost Structure', 'Staff ≈ GH₵8.6k/mo · cloud & AI ≈ GH₵1.2k/mo · marketing · equipment · compliance'],
    ['Revenue Streams', '2.5% sales · 3% campaigns · 0.5% escrow · subscriptions · boosts · supplier/group-buy · insurance/loan/data'],
  ]
  let i = 0
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 0.5 + col * 4.15
      const y = 1.7 + row * 1.72
      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 4.0, h: 1.6, rectRadius: 0.05, fill: { color: 'F8FAF9' }, line: { color: C.green, width: 1 } })
      s.addText(blocks[i][0], { x: x + 0.12, y: y + 0.08, w: 3.76, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: C.deep })
      s.addText(blocks[i][1], { x: x + 0.12, y: y + 0.42, w: 3.76, h: 1.1, fontFace: FONT, fontSize: 9, color: C.ink, valign: 'top' })
      i++
    }
  }
  s.addNotes('Backup slide if judges ask to see the full canvas — the deck above is built directly from it.')
}

pptx.writeFile({ fileName: path.join(__dirname, 'FarmLink_Pitch.pptx') }).then((fn) => {
  console.log('Wrote ' + fn)
})
