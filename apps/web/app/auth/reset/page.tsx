'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, ApiError } from '@/lib/api'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetContent />
    </Suspense>
  )
}

function ResetContent() {
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 2000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset the password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-[1.75rem] font-bold tracking-tight text-gray-900 mb-2">Set a new password</h1>
      <p className="text-gray-500 mb-8">Choose a strong password of at least 8 characters.</p>

      {!token && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
          This reset link is missing its token. Request a new one from the forgot-password page.
        </div>
      )}

      {done ? (
        <div className="px-4 py-4 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-800">
          Password updated. Redirecting you to sign in…
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="pw" className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
              <input id="pw" type="password" required minLength={8} autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="pw2" className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
              <input id="pw2" type="password" required minLength={8} autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClasses} />
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-all shadow-lg shadow-brand-600/25"
            >
              {loading ? 'Updating…' : 'Reset password'}
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-center text-[15px] text-gray-500">
        <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to sign in</Link>
      </p>
    </div>
  )
}
