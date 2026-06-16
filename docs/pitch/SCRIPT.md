# FarmLink Pitch — Speaker Script, Shot-List & Demo Setup

**Deck:** `FarmLink_Pitch.pptx` (16 slides). Regenerate after edits: `cd docs/pitch && node generate-deck.js`.
Brand: forest green `#14532d` / action green `#16a34a` / amber `#f59e0b`.

---

## ⚙️ Before you present (do this once)

1. **Seed the demo data** so the platform looks alive:
   ```bash
   cd apps/api
   npx ts-node prisma/seed-demo.ts        # wipeable; re-run to reset
   npx ts-node prisma/seed-plans.ts       # subscription plans (BMC prices)
   npx ts-node prisma/seed-prices.ts      # price-trend history
   ```
   ⚠️ `seed-demo` clears existing profiles/listings/etc. (keeps plans + price history). It's for the demo; swap for real data after launch.
2. **Take the screenshots** in the shot-list below and drop them into the dashed `[Screenshot: …]` boxes in the deck.
3. **Fill in placeholders:** survey stats (slide 3), the 10 team members (slide 15), and your live URL (slide 11).
4. Open **View → Notes** in PowerPoint — every slide has talking points.

### Demo logins (all password: `demo1234`)
| Role | Email |
|------|-------|
| Farmer | `kwabena.asante.demo@gmail.com` |
| Retailer | `efua.boakye.demo@gmail.com` |
| Investor | `selorm.kudjoe.demo@gmail.com` |
| Admin | `admin@farmlink.test` |

> Demo accounts use real-format gmail addresses so a **live Paystack checkout** works (Paystack rejects `@…​.test` emails). The admin stays on `.test` (no payments needed).

---

## 📸 Screenshot shot-list (what to capture → which slide)

| # | Screen | Log in as | Slide |
|---|--------|-----------|-------|
| 1 | Marketplace grid (shows a **Boosted** tomato listing on top) + open an order modal | Retailer | 6 |
| 2 | A demand request expanded with farmer **bids** | Retailer | 7 (top-left) |
| 3 | A harvest **campaign** page + the investor **portfolio** | Investor | 7 (top-right) |
| 4 | **AI Crop Doctor** result (run one diagnosis, or open history) | Farmer | 7 (bottom-left) |
| 5 | **Admin** dashboard — Disputes tab (there's 1 disputed order) + metrics | Admin | 7 (bottom-right) |
| 6 | **Dashboard overview** with non-zero stat cards | Farmer or Retailer | 11 |

Tip: capture at 1280–1600px wide, light theme, no personal browser chrome.

---

## 🎤 Talking script (~10 minutes)

**1 · Title (15s)** — "Ghana grows the food, but the people who grow it earn the least. FarmLink lets farmers, buyers and everyday investors trade and grow together — with trust built in."

**2 · Problem (60s)** — One story: a tomato farmer dumps unsold crop while Accra hotels import paste. Then the four breaks: middlemen, no price transparency, no financing, no trust. Land the **GH₵38.9bn** import bill — the demand is here; the chain is broken.

**3 · Validation (45s)** — "We didn't guess — we asked." Read your 3 survey stats + sample size. If you have a killer quote, say it verbatim.

**4 · Solution (60s)** — FarmLink = one trusted platform: marketplace + escrow, demand auctions, harvest investing from GH₵100, AI Crop Doctor + Trust Scores. Land the line: *the only platform in Ghana combining all four.*

**5 · How it works (60s)** — Walk ONE loop: retailer posts a demand → farmers bid → buyer accepts → pays into escrow → delivery → money released → Trust Scores rise. Escrow is the spine.

**6 · Product: marketplace (45s)** — "This is live." Show the screenshot (or demo). Order → Paystack → escrow until delivery.

**7 · Product: the rest (45s)** — Four shots: demand auctions, investing, AI doctor, admin/disputes. "We've built the whole loop, including operations."

**8 · Market (60s)** — TAM (ag ≈21% GDP, ~US$2bn imports), SAM (digitally reachable), SOM (10,000 farmers, 3 regions, year 1). Frame SOM as a beachhead, not the whole market.

**9 · Business model (60s)** — Take-rate (2.5% / 3% / 0.5%) — already in the product — plus subscriptions, boosts. Unit economics: a GH₵5,000 campaign = GH₵150; orders + subs stack on top.

**10 · Competition (60s)** — Credit the incumbents (Esoko/Farmerline reach millions with info; AgroCenta/Complete Farmer do marketplace). Our wedge: trade + investment + AI behind one trust layer. **Killer line:** public agri-crowdfunding in Africa collapsed on trust — we're built trust-first.

**11 · Traction (45s)** — "A working product, not slideware." Offer a 60-second live demo. This is the edge over other teams.

**12 · Go-to-market (45s)** — Cooperatives + radio to reach rural farmers cheaply; social for investors; phased region rollout.

**13 · Financials (45s)** — Walk the 3-year table; break-even ~mid Year 2 on a ~GH₵118k/yr base. Say "illustrative" — these are planning estimates.

**14 · Roadmap (30s)** — KYC at scale, mobile/USSD, insurance pool, group buying — deepening the trust + financing moat.

**15 · Team & ask (45s)** — Team of 10. **The ask:** GH₵250,000 pre-seed + pilot partners — walk the breakdown (it's derived from our cost structure) and state exactly what it buys: 10,000 farmers, 3 regions, break-even in sight.

**16 · Appendix (BMC)** — Only if asked; the whole deck is built from this canvas.

---

## ✅ Pre-flight checklist
- [ ] Seeds run; logged in and clicked through marketplace / campaigns / demands / orders / admin
- [ ] 6 screenshots dropped into the deck
- [ ] Survey numbers (slide 3), team (slide 15), live URL (slide 11) filled in
- [ ] One device ready for the live demo (API wakes from sleep — open it 1 min early)
- [ ] Practised once with the speaker notes; under time
