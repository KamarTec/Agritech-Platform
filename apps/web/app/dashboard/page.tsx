'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/logo'
import { clearAuth, getStoredUser } from '@/lib/auth'
import type { User } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const stored = getStoredUser()
    if (!stored) {
      router.replace('/auth/login')
      return
    }
    setUser(stored)
    setChecked(true)
  }, [router])

  function handleSignOut(): void {
    clearAuth()
    router.push('/')
  }

  if (!checked || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <Logo />
      <div className="mt-8 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold">
        {user.role}
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        Welcome, {user.fullName ?? user.email} 👋
      </h1>
      <p className="mt-3 text-gray-500 max-w-md">
        Your account is live. The role-based dashboard (marketplace, campaigns,
        demand requests) is the next thing we’re building.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
        >
          Back to home
        </Link>
        <button
          onClick={handleSignOut}
          className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
