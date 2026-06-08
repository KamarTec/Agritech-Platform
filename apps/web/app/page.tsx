'use client'

import { Navbar } from '@/components/navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Connect. Invest. <span className="text-green-600">Grow.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                FarmLink connects farmers, retailers, and investors on a single trusted platform.
                Invest in harvests, find quality produce, and support agricultural growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/auth/register"
                  className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center font-semibold"
                >
                  Get Started Free
                </a>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition text-center font-semibold"
                >
                  Learn More
                </a>
              </div>
              <div className="mt-8 flex gap-8 text-sm text-gray-600">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">5K+</div>
                  <p>Farmers Connected</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">2K+</div>
                  <p>Active Retailers</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">₵2.5M+</div>
                  <p>Invested</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-full h-96 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🌾</div>
                  <p className="text-xl font-semibold">Your Agricultural Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Powerful Features for Everyone
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Harvest Investment',
                description: 'Invest directly in crops and earn profits from the harvest. Transparent, secure, and rewarding.',
              },
              {
                icon: '🤖',
                title: 'AI Crop Doctor',
                description: 'Upload a photo of your crop. Our AI instantly diagnoses diseases and suggests treatments.',
              },
              {
                icon: '🔄',
                title: 'Reverse Marketplace',
                description: 'Retailers post demands, farmers bid. Find quality produce at fair prices.',
              },
              {
                icon: '💳',
                title: 'Secure Escrow',
                description: 'Every transaction is protected. Payment released only when both parties confirm.',
              },
              {
                icon: '⭐',
                title: 'Trust Score',
                description: 'Build your reputation on the platform. Higher scores unlock exclusive opportunities.',
              },
              {
                icon: '📊',
                title: 'Price Intelligence',
                description: 'Historical trends and predictive insights to help you sell at the best time.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How FarmLink Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Up</h3>
              <p className="text-gray-600">
                Create your account as a Farmer, Retailer, or Investor. Quick KYC verification.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect & Trade</h3>
              <p className="text-gray-600">
                Browse opportunities, post offers, invest in campaigns, or request supplies.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transact Safely</h3>
              <p className="text-gray-600">
                Secure escrow payments, real-time tracking, and instant settlements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Plans for Every Role
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: 'Free',
                price: '₵0',
                period: '/month',
                features: ['5 listings', '10 AI diagnoses', '3 demand requests', 'Standard support'],
                cta: 'Get Started',
              },
              {
                name: 'Farmer Pro',
                price: '₵49',
                period: '/month',
                features: ['Unlimited listings', '100 AI diagnoses', 'Price alerts', 'Priority support'],
                cta: 'Upgrade Now',
                highlight: true,
              },
              {
                name: 'Retailer Pro',
                price: '₵79',
                period: '/month',
                features: ['Unlimited requests', 'Group buying tools', 'Analytics', 'Priority matching'],
                cta: 'Upgrade Now',
              },
              {
                name: 'Business',
                price: '₵199',
                period: '/month',
                features: ['All features', 'Account manager', 'Data export', 'API access'],
                cta: 'Contact Sales',
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-xl border-2 transition ${
                  plan.highlight
                    ? 'border-green-600 bg-green-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-600">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.highlight
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'border-2 border-gray-300 text-gray-900 hover:border-green-600 hover:text-green-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Agriculture?</h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of farmers, retailers, and investors building a better food system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Start Free Trial
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="text-white font-bold">FarmLink</span>
            </div>
            <p className="text-sm">
              Connecting farmers, retailers, and investors for sustainable agriculture.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Marketplace</a></li>
              <li><a href="#" className="hover:text-white transition">Investments</a></li>
              <li><a href="#" className="hover:text-white transition">AI Tools</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 FarmLink. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
