'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { InitializeOrderResult, Listing, PaginatedListings } from '@/lib/api'
import { cropEmoji, timeAgo } from '@/lib/format'
import { useUser } from '../user-context'

const POPULAR_CROPS = ['Tomatoes', 'Maize', 'Cassava', 'Onions', 'Plantain', 'Rice', 'Yam', 'Pepper']

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function MarketplacePage() {
  const user = useUser()
  const [data, setData] = useState<PaginatedListings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [crop, setCrop] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [orderTarget, setOrderTarget] = useState<Listing | null>(null)
  const [orderQty, setOrderQty] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  async function handleOrder(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!orderTarget) return
    setOrdering(true)
    setOrderError(null)
    try {
      const result = await api.post<InitializeOrderResult>('/transactions/initialize', {
        listingId: orderTarget.id,
        quantityKg: Number(orderQty),
      })
      window.location.href = result.authorizationUrl // off to Paystack checkout
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : 'Could not start the order. Try again.')
      setOrdering(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (crop) params.set('crop', crop)
    params.set('page', String(page))
    params.set('limit', '12')

    const timer = setTimeout(async () => {
      try {
        const result = await api.get<PaginatedListings>(`/listings?${params.toString()}`)
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load the marketplace. Is the API running?')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300) // debounce search typing

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [search, crop, page])

  function selectCrop(value: string): void {
    setCrop((current) => (current === value ? '' : value))
    setPage(1)
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Marketplace</h1>
      <p className="mt-1 text-gray-500">Fresh produce, direct from verified farms.</p>

      {/* Search + filters */}
      <div className="mt-6 space-y-3">
        <div className="relative max-w-xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search crops, farms, locations…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CROPS.map((c) => (
            <button
              key={c}
              onClick={() => selectCrop(c)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                crop === c
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && data && data.items.length === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🧺</div>
          <h2 className="text-lg font-bold text-gray-900">No produce found</h2>
          <p className="mt-1 text-gray-500">
            {search || crop ? 'Try a different search or filter.' : 'Check back soon — farmers are joining every day.'}
          </p>
        </div>
      )}

      {/* Listing cards */}
      {!loading && data && data.items.length > 0 && (
        <>
          <p className="mt-6 text-sm text-gray-400">
            {data.total} listing{data.total === 1 ? '' : 's'} available
          </p>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                canOrder={listing.farm.farmerId !== user.id}
                onOrder={() => {
                  setOrderTarget(listing)
                  setOrderQty('')
                  setOrderError(null)
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-brand-400 transition-colors"
              >
                ← Previous
              </button>
              <span className="px-3 text-sm text-gray-500">
                Page {data.page} of {data.pages}
              </span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-brand-400 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Order modal */}
      {orderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !ordering && setOrderTarget(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">Order {orderTarget.crop}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {orderTarget.farm.name} · GH₵ {orderTarget.pricePerKg.toFixed(2)}/kg ·{' '}
              {orderTarget.quantityKg.toLocaleString()} kg available
            </p>

            {orderError && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {orderError}
              </div>
            )}

            <form onSubmit={handleOrder} className="mt-5 space-y-4">
              <div>
                <label htmlFor="order-qty" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Quantity (kg)
                </label>
                <input
                  id="order-qty"
                  type="number"
                  required
                  min="0.1"
                  max={orderTarget.quantityKg}
                  step="0.1"
                  placeholder="100"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  className={inputClasses}
                />
                {Number(orderQty) > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Total:{' '}
                    <span className="font-bold text-gray-900">
                      GH₵ {(Number(orderQty) * orderTarget.pricePerKg).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 text-xs text-brand-800">
                🛡️ Escrow protected: you pay now via Paystack, the farmer only receives the money
                after you confirm delivery.
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  disabled={ordering}
                  onClick={() => setOrderTarget(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ordering}
                  className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
                >
                  {ordering ? 'Redirecting…' : 'Pay with Paystack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ListingCard({
  listing,
  canOrder,
  onOrder,
}: {
  listing: Listing
  canOrder: boolean
  onOrder: () => void
}) {
  const posted = timeAgo(listing.createdAt)
  return (
    <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all">
      {/* Placeholder visual until photo uploads ship */}
      <Link href={`/dashboard/marketplace/${listing.id}`} className="block">
        {listing.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.photos[0]} alt={listing.crop} className="h-28 w-full object-cover" />
        ) : (
          <div className="h-28 bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
            <span className="text-4xl">{cropEmoji(listing.crop)}</span>
          </div>
        )}
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/dashboard/marketplace/${listing.id}`}
            className="font-bold text-gray-900 hover:text-brand-700 transition-colors"
          >
            {listing.crop}
            {listing.boosted && (
              <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                Boosted
              </span>
            )}
          </Link>
          <span className="shrink-0 text-xs text-gray-400">{posted}</span>
        </div>
        <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1">
          <span className="truncate">
            {listing.farm.name} · {listing.farm.location}
          </span>
          {listing.farm.verified && <span className="shrink-0 text-brand-600 font-bold">✓</span>}
        </p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900">
              GH₵ {listing.pricePerKg.toFixed(2)}
              <span className="text-sm font-medium text-gray-400"> /kg</span>
            </div>
            <div className="text-sm text-gray-500">{listing.quantityKg.toLocaleString()} kg available</div>
          </div>
          {canOrder ? (
            <button
              onClick={onOrder}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Order
            </button>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold">
              Your listing
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
