'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Farm, Listing } from '@/lib/api'
import { useUser } from './layout'

interface Stats {
  farms: number
  activeListings: number
  totalListings: number
}

export default function OverviewPage() {
  const user = useUser()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (user.role !== 'FARMER') return
    let cancelled = false

    async function load(): Promise<void> {
      try {
        const [farms, listings] = await Promise.all([
          api.get<Farm[]>('/farms/mine'),
          api.get<Listing[]>('/listings/mine'),
        ])
        if (!cancelled) {
          setStats({
            farms: farms.length,
            activeListings: listings.filter((l) => l.status === 'ACTIVE').length,
            totalListings: listings.length,
          })
        }
      } catch {
        // stats are non-critical; ignore load failures here
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user.role])

  const firstName = (user.fullName ?? user.email).split(' ')[0]

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
        Welcome back, {firstName} 👋
      </h1>
      <p className="mt-1 text-gray-500">
        {user.role === 'FARMER' && 'Manage your farms and listings, and reach buyers directly.'}
        {user.role === 'RETAILER' && 'Browse the marketplace and source produce directly from farms.'}
        {user.role === 'INVESTOR' && 'Harvest campaigns are coming soon — browse the marketplace meanwhile.'}
        {user.role === 'SUPPLIER' && 'The supplier marketplace is coming soon.'}
        {user.role === 'ADMIN' && 'Platform administration.'}
      </p>

      {/* Stat cards (farmer) */}
      {user.role === 'FARMER' && (
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <StatCard label="My farms" value={stats ? String(stats.farms) : '—'} href="/dashboard/farms" />
          <StatCard label="Active listings" value={stats ? String(stats.activeListings) : '—'} href="/dashboard/listings" />
          <StatCard label="Total listings" value={stats ? String(stats.totalListings) : '—'} href="/dashboard/listings" />
        </div>
      )}

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
          Harvest investment campaigns, AI Crop Doctor, retailer demand requests with bidding, and
          escrow-protected payments are on the way. You&apos;ll see them appear in the sidebar as they launch.
        </p>
      </div>
    </div>
  )
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
