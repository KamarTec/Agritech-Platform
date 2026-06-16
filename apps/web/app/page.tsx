import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Logo } from '@/components/logo'
import { PublicListings, FinalCtaButtons } from '@/components/landing-client'
import { LeafIcon } from '@/components/icons'

/* ---------- Inline icons (24x24, stroke) ---------- */

function Icon({ d, className = '' }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  )
}

const icons = {
  chart:
    'M3 3v18h18M7 14l4-4 3 3 5-6',
  scan:
    'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  swap:
    'M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4',
  shield:
    'M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3zM9 12l2 2 4-4',
  star:
    'M12 3l2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9L12 3z',
  trend:
    'M3 17l6-6 4 4 8-8m0 0h-5m5 0v5',
  sprout:
    'M12 21V11M12 11C12 7 9 4.5 4.5 4.5 4.5 9 7.5 11 12 11ZM12 13.5c0-3.3 2.5-5.5 7.5-5.5 0 4-3 5.5-7.5 5.5Z',
  store:
    'M4 4h16l1 5H3l1-5zM5 9v11h14V9M9 20v-6h6v6',
  wallet:
    'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm0 3h18M16 14h2',
  check: 'M5 13l4 4L19 7',
}

/* ---------- Page ---------- */

export default function Home() {
  return (
    <main className="bg-white">
      <Navbar />
      <Hero />
      <TrustBar />
      <PublicListings />
      <Features />
      <HowItWorks />
      <Roles />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-forest pt-32 pb-24 lg:pt-44 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-600/15 blur-3xl" />
        <div className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Now live in Ghana — Join the early access
            </div>

            <h1 className="text-[2.75rem] leading-[1.08] sm:text-6xl font-bold tracking-tight text-white mb-6 animate-fade-in-up">
              Agriculture,
              <br />
              <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-amber-400 bg-clip-text text-transparent">
                connected & funded.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300/90 leading-relaxed max-w-xl mb-10 animate-fade-in-up [animation-delay:100ms]">
              FarmLink brings farmers, retailers, and investors onto one trusted
              platform — invest in real harvests, source produce directly, and
              diagnose crops with AI. Payments protected by escrow, every time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:200ms]">
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold text-forest bg-white rounded-xl hover:bg-brand-50 shadow-xl shadow-black/20 transition-all"
              >
                Create free account
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-7 py-4 text-base font-semibold text-white border border-white/20 rounded-xl hover:bg-white/10 backdrop-blur transition-all"
              >
                See how it works
              </a>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 max-w-md animate-fade-in-up [animation-delay:300ms]">
              {[
                ['5,000+', 'Farmers onboarding'],
                ['GH₵2.5M+', 'Target investments'],
                ['98%', 'Escrow protected'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-sm text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Product preview */}
          <div className="relative hidden lg:block animate-fade-in [animation-delay:300ms]">
            <CampaignCard />
            <DiagnosisCard />
            <PayoutToast />
          </div>
        </div>
      </div>
    </section>
  )
}

/* Mock UI cards for the hero */

function CampaignCard() {
  return (
    <div className="relative ml-auto w-[420px] rounded-2xl bg-white shadow-2xl shadow-black/40 p-6 rotate-1">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center">
            <Icon d={icons.sprout} className="w-6 h-6 text-brand-700" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Tomato Harvest — Kumasi</div>
            <div className="text-sm text-gray-500 inline-flex items-center gap-1">
              Kwame Farms · Verified
              <LeafIcon className="w-3.5 h-3.5 text-brand-600" />
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
          ACTIVE
        </span>
      </div>

      <div className="mb-2 flex justify-between text-sm">
        <span className="text-gray-500">Raised</span>
        <span className="font-semibold text-gray-900">GH₵8,400 / GH₵12,000</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-5">
        <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-brand-500 to-brand-600" />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ['70%', 'Funded'],
          ['18%', 'Profit share'],
          ['94 days', 'To harvest'],
        ].map(([v, l]) => (
          <div key={l} className="rounded-xl bg-gray-50 py-3">
            <div className="font-bold text-gray-900">{v}</div>
            <div className="text-xs text-gray-500 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <button className="mt-5 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm">
        Invest in this harvest
      </button>
    </div>
  )
}

function DiagnosisCard() {
  return (
    <div className="absolute -bottom-10 -left-2 w-[300px] rounded-2xl bg-forest-light border border-white/10 backdrop-blur shadow-2xl shadow-black/40 p-5 -rotate-2">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center">
          <Icon d={icons.scan} className="w-5 h-5 text-amber-400" />
        </div>
        <div className="text-sm font-semibold text-white">AI Crop Doctor</div>
        <span className="ml-auto text-[10px] font-bold text-brand-300 bg-brand-500/15 px-2 py-0.5 rounded-full">
          GEMINI
        </span>
      </div>
      <div className="text-sm text-gray-300 leading-relaxed">
        <span className="text-white font-medium">Diagnosis:</span> Early blight
        detected (moderate). Apply copper-based fungicide within 48h.
      </div>
      <div className="mt-3 text-xs text-gray-400">
        Est. treatment cost: <span className="text-brand-300 font-semibold">GH₵120</span>
      </div>
    </div>
  )
}

function PayoutToast() {
  return (
    <div className="absolute -top-8 right-10 flex items-center gap-3 rounded-2xl bg-white shadow-xl shadow-black/30 px-4 py-3 rotate-2">
      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
        <Icon d={icons.check} className="w-5 h-5 text-brand-600" />
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900">Escrow released</div>
        <div className="text-xs text-gray-500">GH₵4,250 → Kwame Farms</div>
      </div>
    </div>
  )
}

/* ---------- Trust bar ---------- */

function TrustBar() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">
          Built on trusted infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-gray-400">
          {['Paystack', 'Google Gemini', 'Cloudflare', 'DigitalOcean', "Africa's Talking"].map(
            (name) => (
              <span key={name} className="text-lg font-bold tracking-tight text-gray-300 hover:text-gray-400 transition-colors">
                {name}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Features ---------- */

const features = [
  {
    icon: icons.trend,
    title: 'Harvest Investment Marketplace',
    description:
      'Investors fund real crop campaigns and earn a share of harvest profits. Transparent progress tracking from seed to settlement.',
    accent: 'bg-brand-50 text-brand-700',
  },
  {
    icon: icons.scan,
    title: 'AI Crop Doctor',
    description:
      'Snap a photo of a sick crop and get an instant AI diagnosis — disease, severity, treatment steps, and estimated cost.',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    icon: icons.swap,
    title: 'Reverse Marketplace',
    description:
      'Retailers post exactly what they need; farmers compete with bids. A tender system that gets both sides the best deal.',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    icon: icons.shield,
    title: 'Escrow-Protected Payments',
    description:
      'Money is held safely until delivery is confirmed by both sides. Disputes are mediated with evidence — no more trust issues.',
    accent: 'bg-brand-50 text-brand-700',
  },
  {
    icon: icons.star,
    title: 'Farm Trust Score',
    description:
      'Reputation built from completed deals, ratings, and verification. High scores unlock better rates and investor access.',
    accent: 'bg-purple-50 text-purple-600',
  },
  {
    icon: icons.chart,
    title: 'Price Intelligence',
    description:
      'Historical price trends and sell-window suggestions for major crops, so farmers sell at the right time — not the desperate time.',
    accent: 'bg-rose-50 text-rose-600',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-3">
            Platform features
          </p>
          <h2 className="text-3xl sm:text-[2.6rem] leading-tight font-bold tracking-tight text-gray-900 mb-5">
            Everything the agricultural value chain needs
          </h2>
          <p className="text-lg text-gray-500">
            Not just a marketplace — a complete ecosystem for growing, funding,
            and trading produce with confidence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative p-8 rounded-2xl border border-gray-200 bg-white hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${f.accent} flex items-center justify-center mb-5`}>
                <Icon d={f.icon} className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2.5">{f.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- How it works ---------- */

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description:
      'Sign up as a farmer, retailer, or investor. Complete a quick KYC verification to unlock the full platform and earn your verified badge.',
  },
  {
    number: '02',
    title: 'Connect & transact',
    description:
      'List produce, launch harvest campaigns, post demand requests, or browse investment opportunities — all matched to your role.',
  },
  {
    number: '03',
    title: 'Get paid, protected',
    description:
      'Every payment flows through escrow. Funds release when both sides confirm — and your Trust Score grows with every completed deal.',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-[2.6rem] leading-tight font-bold tracking-tight text-gray-900">
            From sign-up to settlement in three steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[calc(50%+44px)] w-[calc(100%-88px)] border-t-2 border-dashed border-gray-200" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center text-lg font-bold mb-6 shadow-lg shadow-forest/20">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-gray-500 max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Roles ---------- */

const roles = [
  {
    icon: icons.sprout,
    title: 'For Farmers',
    tagline: 'Grow your reach, fund your season',
    points: [
      'Sell produce directly — no middlemen taking margins',
      'Raise funding for your harvest from real investors',
      'Free AI crop diagnosis in your pocket',
      'Build a Trust Score that unlocks loans & better deals',
    ],
    cta: 'Start selling',
    gradient: 'from-brand-600 to-brand-800',
  },
  {
    icon: icons.store,
    title: 'For Retailers',
    tagline: 'Source smarter, pay safer',
    points: [
      'Post exactly what you need and let farmers bid',
      'Lock in recurring supply with pre-order contracts',
      'Escrow protection on every single order',
      'Join group buys for bulk discounts on inputs',
    ],
    cta: 'Start sourcing',
    gradient: 'from-blue-600 to-blue-800',
  },
  {
    icon: icons.wallet,
    title: 'For Investors',
    tagline: 'Invest in real harvests, real returns',
    points: [
      'Fund crop campaigns from as little as GH₵100',
      'Track your portfolio from seed to settlement',
      'Profit shares paid out automatically via Paystack',
      'Invest only in KYC-verified, scored farms',
    ],
    cta: 'Start investing',
    gradient: 'from-amber-500 to-orange-600',
  },
]

function Roles() {
  return (
    <section id="roles" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-3">
            Who it’s for
          </p>
          <h2 className="text-3xl sm:text-[2.6rem] leading-tight font-bold tracking-tight text-gray-900">
            One platform, three ways to win
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.title}
              className="flex flex-col rounded-3xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:shadow-gray-900/5 transition-shadow duration-300"
            >
              <div className={`bg-gradient-to-br ${role.gradient} p-7 text-white`}>
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center mb-4">
                  <Icon d={role.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{role.title}</h3>
                <p className="text-white/80 text-[15px]">{role.tagline}</p>
              </div>
              <div className="flex flex-col flex-1 p-7">
                <ul className="space-y-3.5 mb-8">
                  {role.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[15px] text-gray-600">
                      <Icon d={icons.check} className="w-5 h-5 shrink-0 text-brand-600 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="mt-auto inline-flex justify-center px-5 py-3 rounded-xl border-2 border-gray-900 text-gray-900 font-semibold text-[15px] hover:bg-gray-900 hover:text-white transition-colors"
                >
                  {role.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Pricing ---------- */

const plans = [
  {
    name: 'Free',
    price: '0',
    blurb: 'Everything you need to get started',
    features: ['5 active listings', '10 AI diagnoses / month', '3 demand requests', 'Escrow protection', 'Community support'],
    cta: 'Get started',
    featured: false,
  },
  {
    name: 'Farmer Pro',
    price: '49',
    blurb: 'For farmers ready to scale',
    features: ['Unlimited listings', '100 AI diagnoses / month', 'Price alerts & analytics', 'Featured placement', 'Priority support'],
    cta: 'Start 14-day trial',
    featured: true,
  },
  {
    name: 'Retailer Pro',
    price: '79',
    blurb: 'For serious produce buyers',
    features: ['Unlimited demand requests', 'Group buying tools', 'Sourcing analytics', 'Priority matching', 'Priority support'],
    cta: 'Start 14-day trial',
    featured: false,
  },
  {
    name: 'Business',
    price: '199',
    blurb: 'For agribusiness at scale',
    features: ['Everything in Pro', 'Dedicated account manager', 'Data export & API access', 'Reduced platform fees', 'SLA support'],
    cta: 'Contact sales',
    featured: false,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-[2.6rem] leading-tight font-bold tracking-tight text-gray-900 mb-5">
            Start free. Upgrade when you grow.
          </h2>
          <p className="text-lg text-gray-500">
            No hidden charges — transaction fees only on successful deals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl p-7 ${
                plan.featured
                  ? 'bg-forest text-white shadow-2xl shadow-forest/30 lg:-translate-y-3'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-amber-400 text-forest text-xs font-bold uppercase tracking-wide">
                  Most popular
                </span>
              )}
              <h3 className={`text-lg font-bold mb-1 ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-5 ${plan.featured ? 'text-gray-300' : 'text-gray-500'}`}>
                {plan.blurb}
              </p>
              <div className="flex items-baseline gap-1 mb-7">
                <span className={`text-sm font-semibold ${plan.featured ? 'text-gray-300' : 'text-gray-500'}`}>
                  GH₵
                </span>
                <span className={`text-[2.75rem] leading-none font-bold ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.featured ? 'text-gray-300' : 'text-gray-500'}`}>
                  /month
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm">
                    <Icon
                      d={icons.check}
                      className={`w-5 h-5 shrink-0 ${plan.featured ? 'text-brand-400' : 'text-brand-600'}`}
                    />
                    <span className={plan.featured ? 'text-gray-200' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`mt-auto inline-flex justify-center px-5 py-3 rounded-xl font-semibold text-[15px] transition-colors ${
                  plan.featured
                    ? 'bg-white text-forest hover:bg-brand-50'
                    : 'border-2 border-gray-200 text-gray-900 hover:border-brand-600 hover:text-brand-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-forest px-8 py-20 lg:px-20 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-brand-500/20 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
              Ready to grow with us?
            </h2>
            <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
              Join the platform connecting Ghana’s farms to retailers and
              capital. Free to start — takes under two minutes.
            </p>
            <FinalCtaButtons />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */

const footerCols = [
  {
    heading: 'Platform',
    links: ['Marketplace', 'Harvest Investments', 'Demand Requests', 'AI Crop Doctor', 'Pricing'],
  },
  {
    heading: 'Company',
    links: ['About us', 'Blog', 'Careers', 'Contact'],
  },
  {
    heading: 'Resources',
    links: ['Help center', 'Farmer guides', 'Market reports', 'API docs'],
  },
  {
    heading: 'Legal',
    links: ['Privacy policy', 'Terms of service', 'Security', 'Escrow policy'],
  },
]

function Footer() {
  return (
    <footer className="bg-forest text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
          <div className="col-span-2">
            <Logo dark />
            <p className="mt-5 text-sm leading-relaxed max-w-xs">
              Connecting farmers, retailers, and investors for a stronger,
              fairer agricultural economy.
            </p>
          </div>
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} FarmLink. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Proudly built in Ghana
            <LeafIcon className="w-4 h-4 text-brand-500" />
          </p>
        </div>
      </div>
    </footer>
  )
}
