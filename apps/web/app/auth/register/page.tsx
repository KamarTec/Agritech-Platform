'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Role = 'FARMER' | 'RETAILER' | 'INVESTOR'

const roleOptions: {
  value: Role
  title: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    value: 'FARMER',
    title: 'Farmer',
    description: 'Sell produce, raise harvest funding, and use the AI Crop Doctor.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21V11M12 11C12 7 9 4.5 4.5 4.5 4.5 9 7.5 11 12 11ZM12 13.5c0-3.3 2.5-5.5 7.5-5.5 0 4-3 5.5-7.5 5.5Z" />
      </svg>
    ),
  },
  {
    value: 'RETAILER',
    title: 'Retailer',
    description: 'Source produce directly, post demand requests, and join group buys.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16l1 5H3l1-5zM5 9v11h14V9M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    value: 'INVESTOR',
    title: 'Investor',
    description: 'Fund harvest campaigns and earn a share of real crop profits.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" />
      </svg>
    ),
  },
]

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function selectRole(selected: Role): void {
    setRole(selected)
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    try {
      // TODO: wire to NestJS POST /auth/register once the API is connected
      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s <= step ? 'w-10 bg-brand-600' : 'w-10 bg-gray-200'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-400 font-medium">
          Step {step} of 2
        </span>
      </div>

      {step === 1 ? (
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-900 mb-2">
            Join FarmLink
          </h1>
          <p className="text-gray-500 mb-8">
            First things first — how will you use the platform?
          </p>

          <div className="space-y-3.5">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectRole(option.value)}
                className="group w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 text-left hover:border-brand-500 hover:bg-brand-50/40 transition-all"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-700 flex items-center justify-center transition-colors">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 mb-0.5">{option.title}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">
                    {option.description}
                  </div>
                </div>
                <svg className="w-5 h-5 shrink-0 mt-3 text-gray-300 group-hover:text-brand-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-[15px] text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5m6 6-6-6 6-6" />
            </svg>
            Change role
          </button>

          <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-900 mb-2">
            Create your {role && roleLabel(role)} account
          </h1>
          <p className="text-gray-500 mb-8">
            Free forever on the starter plan. No card required.
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Kwame Mensah"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-600/25 transition-all"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
            By creating an account you agree to FarmLink’s{' '}
            <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </div>
      )}
    </div>
  )
}

function roleLabel(role: Role): string {
  return { FARMER: 'farmer', RETAILER: 'retailer', INVESTOR: 'investor' }[role]
}
