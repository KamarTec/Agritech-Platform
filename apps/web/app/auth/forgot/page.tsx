'use client'

import Link from 'next/link'
import { useState } from 'react'
import { api, ApiError } from '@/lib/api'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-900 mb-2">Forgot your password?</h1>
      <p className="text-gray-500 mb-8">Enter your email and we&apos;ll send you a reset link.</p>

      {sent ? (
        <div className="px-4 py-4 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-800">
          If an account exists for <span className="font-semibold">{email}</span>, a reset link is on its way.
          Check your inbox (and spam).
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-all shadow-lg shadow-brand-600/25"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-center text-[15px] text-gray-500">
        Remembered it?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to sign in</Link>
      </p>
    </div>
  )
}
