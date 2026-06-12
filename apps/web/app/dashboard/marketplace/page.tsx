'use client'

import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { Listing, PaginatedListings } from '@/lib/api'

const POPULAR_CROPS = ['Tomatoes', 'Maize', 'Cassava', 'Onions', 'Plantain', 'Rice', 'Yam', 'Pepper']

export default function MarketplacePage() {
  const [data, setData] = useState<PaginatedListings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [crop, setCrop] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

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
              <ListingCard key={listing.id} listing={listing} />
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
    </div>
  )
}

function ListingCard({ listing }: { listing: Listing }) {
  const posted = timeAgo(listing.createdAt)
  return (
    <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all">
      {/* Placeholder visual until photo uploads ship */}
      <div className="h-28 bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
        <span className="text-4xl">{cropEmoji(listing.crop)}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900">{listing.crop}</h3>
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
          <button
            title="Ordering with escrow protection is coming soon"
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
          >
            Order soon
          </button>
        </div>
      </div>
    </div>
  )
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function cropEmoji(crop: string): string {
  const c = crop.toLowerCase()
  if (c.includes('tomato')) return '🍅'
  if (c.includes('maize') || c.includes('corn')) return '🌽'
  if (c.includes('onion')) return '🧅'
  if (c.includes('pepper') || c.includes('chil')) return '🌶️'
  if (c.includes('plantain') || c.includes('banana')) return '🍌'
  if (c.includes('rice')) return '🍚'
  if (c.includes('yam') || c.includes('potato') || c.includes('cassava')) return '🍠'
  if (c.includes('mango')) return '🥭'
  if (c.includes('pineapple')) return '🍍'
  if (c.includes('cocoa')) return '🍫'
  return '🌾'
}
