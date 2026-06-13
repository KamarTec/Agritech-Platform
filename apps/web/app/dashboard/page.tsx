'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { OverviewStats, User } from '@/lib/api'
import { formatGhs } from '@/lib/format'
import { useUser } from './user-context'

export default function OverviewPage() {
  const user = useUser()
  const [stats, setStats] = useState<OverviewStats | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      try {
        const result = await api.get<OverviewStats>('/stats/overview')
        if (!cancelled) setStats(result)
      } catch {
        // stats are non-critical; ignore load failures here
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const firstName = (user.fullName ?? user.email).split(' ')[0]

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
        Welcome back, {firstName} 👋
      </h1>
      <p className="mt-1 text-gray-500">
        {user.role === 'FARMER' && 'Manage your farms and listings, and reach buyers directly.'}
        {user.role === 'RETAILER' && 'Browse the marketplace and source produce directly from farms.'}
        {user.role === 'INVESTOR' && 'Back real harvests for a share of the profits, and track your portfolio.'}
        {user.role === 'SUPPLIER' && 'The supplier marketplace is coming soon.'}
        {user.role === 'ADMIN' && 'Platform administration.'}
      </p>

      {/* Stat cards (role-aware) */}
      <StatGrid stats={stats} role={user.role} />

      {/* Quick actions */}
      <h2 className="mt-10 text-lg font-bold text-gray-900">Quick actions</h2>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {user.role === 'FARMER' && (
          <>
            <ActionCard
              href="/dashboard/farms"
              title="Add a farm"
              description="Register your farm so you can start posting produce."
            />
            <ActionCard
              href="/dashboard/listings"
              title="Post a listing"
              description="List your produce and let buyers find you."
            />
          </>
        )}
        {user.role === 'RETAILER' && (
          <ActionCard
            href="/dashboard/demands"
            title="Post a demand request"
            description="Tell farmers what you need and let them bid to supply you."
          />
        )}
        {user.role === 'INVESTOR' && (
          <ActionCard
            href="/dashboard/campaigns"
            title="Back a harvest"
            description="Fund a campaign and earn a share of the season's profits."
          />
        )}
        <ActionCard
          href="/dashboard/marketplace"
          title="Browse marketplace"
          description="See what produce is available right now."
        />
      </div>

      {/* Coming soon teaser */}
      <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-6">
        <h3 className="font-bold text-gray-900">Coming soon to FarmLink</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
          In-app messaging, photo uploads, trust scores, and real-time notifications are on the way.
          You&apos;ll see them appear in the sidebar as they launch.
        </p>
      </div>
    </div>
  )
}

function StatGrid({ stats, role }: { stats: OverviewStats | null; role: User['role'] }) {
  const loading = stats === null
  const n = (value: number): string => (loading ? '—' : String(value))
  const c = (value: number): string => (loading ? '—' : formatGhs(value))

  if (role === 'FARMER') {
    const s = stats?.role === 'FARMER' ? stats : null
    return (
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="My farms" value={n(s?.farms ?? 0)} href="/dashboard/farms" />
        <StatCard label="Active listings" value={n(s?.activeListings ?? 0)} href="/dashboard/listings" />
        <StatCard label="Pending bids" value={n(s?.pendingBids ?? 0)} href="/dashboard/demands" />
        <StatCard label="Sales in escrow" value={c(s?.salesInEscrow ?? 0)} href="/dashboard/orders" />
        <StatCard label="Total earned" value={c(s?.totalEarned ?? 0)} href="/dashboard/orders" />
      </div>
    )
  }

  if (role === 'RETAILER') {
    const s = stats?.role === 'RETAILER' ? stats : null
    return (
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open requests" value={n(s?.openDemands ?? 0)} href="/dashboard/demands" />
        <StatCard label="Bids received" value={n(s?.bidsReceived ?? 0)} href="/dashboard/demands" />
        <StatCard label="Orders in escrow" value={n(s?.ordersInEscrow ?? 0)} href="/dashboard/orders" />
        <StatCard label="Total spent" value={c(s?.totalSpent ?? 0)} href="/dashboard/orders" />
      </div>
    )
  }

  if (role === 'INVESTOR') {
    const s = stats?.role === 'INVESTOR' ? stats : null
    return (
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active investments" value={n(s?.activeInvestments ?? 0)} href="/dashboard/campaigns" />
        <StatCard label="Portfolio value" value={c(s?.portfolioValue ?? 0)} href="/dashboard/campaigns" />
        <StatCard label="Campaigns backed" value={n(s?.campaignsFunded ?? 0)} href="/dashboard/campaigns" />
        <StatCard label="Paid out" value={c(s?.totalPaidOut ?? 0)} href="/dashboard/campaigns" />
      </div>
    )
  }

  return null
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-white border border-gray-200 p-5 hover:border-brand-300 hover:shadow-md transition-all"
    >
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
    </Link>
  )
}

function ActionCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-white border border-gray-200 p-5 hover:border-brand-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <svg
          className="w-5 h-5 text-gray-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </div>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  )
}
