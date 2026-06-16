'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Listing, PaginatedListings, User } from '@/lib/api'
import { cropImage } from '@/lib/crops'
import { getStoredUser } from '@/lib/auth'
import { ArrowRightIcon, MapPinIcon } from './icons'

/**
 * "Fresh from our farms" — real listings shown to logged-out visitors on the
 * landing page. Cards are auth-gated: tapping one routes to login.
 */
export function PublicListings() {
  const router = useRouter()
  const [items, setItems] = useState<Listing[] | null>(null)

  useEffect(() => {
    api
      .get<PaginatedListings>('/listings?limit=8')
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
  }, [])

  // Nothing to show (no data, or API unreachable) — hide the whole section.
  if (items !== null && items.length === 0) return null

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Fresh from our farms</h2>
          <p className="mt-3 text-lg text-gray-500">
            Real produce listed by Ghanaian farmers. Create a free account to buy, bid, or invest.
          </p>
        </div>

        {items === null ? (
          <div className="mt-12 flex justify-center">
            <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((listing) => (
              <button
                key={listing.id}
                onClick={() => router.push('/auth/login')}
                className="group text-left rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.photos?.[0] ?? cropImage(listing.crop)}
                  alt={listing.crop}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4">
                  <div className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{listing.crop}</div>
                  <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{listing.farm.name} · {listing.farm.location}</span>
                  </p>
                  <div className="mt-3 text-lg font-bold text-gray-900">
                    GH₵ {listing.pricePerKg.toFixed(2)}
                    <span className="text-sm font-medium text-gray-400"> /kg</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-lg shadow-brand-600/25 transition-all"
          >
            Browse all produce
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/** Final-CTA buttons that become "Go to dashboard" once the visitor is logged in. */
export function FinalCtaButtons() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setMounted(true)
  }, [])

  if (mounted && user) {
    return (
      <div className="flex justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-forest font-semibold hover:bg-brand-50 shadow-xl transition-colors"
        >
          Go to dashboard
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        href="/auth/register"
        className="inline-flex justify-center px-8 py-4 rounded-xl bg-white text-forest font-semibold hover:bg-brand-50 shadow-xl transition-colors"
      >
        Create free account
      </Link>
      <Link
        href="/auth/login"
        className="inline-flex justify-center px-8 py-4 rounded-xl border border-white/25 text-white font-semibold hover:bg-white/10 transition-colors"
      >
        Sign in
      </Link>
    </div>
  )
}
