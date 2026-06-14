'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { InitializeOrderResult, ListingDetail } from '@/lib/api'
import { cropEmoji, formatDate, formatGhs, timeAgo } from '@/lib/format'
import { TrustBadge } from '@/components/trust-badge'
import { MessageButton } from '@/components/message-button'
import { useUser } from '../../user-context'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function ListingDetailPage() {
  const user = useUser()
  const { id } = useParams<{ id: string }>()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [orderQty, setOrderQty] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const result = await api.get<ListingDetail>(`/listings/${id}`)
        if (!cancelled) {
          setListing(result)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load this listing.')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleOrder(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!listing) return
    setOrdering(true)
    setOrderError(null)
    try {
      const result = await api.post<InitializeOrderResult>('/transactions/initialize', {
        listingId: listing.id,
        quantityKg: Number(orderQty),
      })
      window.location.href = result.authorizationUrl // off to Paystack checkout
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : 'Could not start the order. Try again.')
      setOrdering(false)
    }
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <BackLink />
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="mt-12 flex justify-center">
        <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isOwn = listing.farm.farmerId === user.id
  const canOrder = !isOwn && listing.status === 'ACTIVE'

  return (
    <div className="max-w-4xl">
      <BackLink />

      <div className="mt-4 grid lg:grid-cols-[1fr,320px] gap-6 items-start">
        {/* Main column */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
            {listing.photos?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.photos[0]} alt={listing.crop} className="h-56 w-full object-cover" />
            ) : (
              <div className="h-44 bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                <span className="text-7xl">{cropEmoji(listing.crop)}</span>
              </div>
            )}
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">{listing.crop}</h1>
                  <p className="mt-1 text-sm text-gray-500">Posted {timeAgo(listing.createdAt)}</p>
                </div>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                    listing.status === 'ACTIVE'
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {listing.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-gray-50 py-3">
                  <div className="font-bold text-gray-900">GH₵ {listing.pricePerKg.toFixed(2)}</div>
                  <div className="text-[11px] text-gray-400">Per kg</div>
                </div>
                <div className="rounded-xl bg-gray-50 py-3">
                  <div className="font-bold text-gray-900">{listing.quantityKg.toLocaleString()} kg</div>
                  <div className="text-[11px] text-gray-400">Available</div>
                </div>
                <div className="rounded-xl bg-gray-50 py-3">
                  <div className="font-bold text-gray-900">
                    {listing.harvestDate ? formatDate(listing.harvestDate) : '—'}
                  </div>
                  <div className="text-[11px] text-gray-400">Harvest date</div>
                </div>
              </div>
            </div>
          </div>

          {/* Farm + farmer card */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Sold by</h2>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/dashboard/farms/${listing.farm.id}`}
                  className="font-bold text-gray-900 hover:text-brand-700 transition-colors"
                >
                  {listing.farm.name}
                  {listing.farm.verified && <span className="text-brand-600"> ✓</span>}
                </Link>
                <p className="mt-0.5 text-sm text-gray-500">{listing.farm.location}</p>
                <p className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-2">
                  <span>{listing.farm.farmer.fullName ?? 'Farmer'}</span>
                  <TrustBadge score={listing.farm.farmer.trustScore} />
                  {listing.farm.farmer.kycStatus === 'VERIFIED' && (
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                      KYC verified
                    </span>
                  )}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link
                  href={`/dashboard/farms/${listing.farm.id}`}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-brand-400 hover:text-brand-700 transition-colors"
                >
                  View farm →
                </Link>
                {!isOwn && (
                  <MessageButton
                    participantId={listing.farm.farmer.id}
                    contextType="listing"
                    contextId={listing.id}
                    label="Message farmer"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order box */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900">Order this produce</h2>

          {isOwn && (
            <p className="mt-3 text-sm text-gray-500">This is your own listing.</p>
          )}
          {!isOwn && listing.status !== 'ACTIVE' && (
            <p className="mt-3 text-sm text-gray-500">This listing is no longer available.</p>
          )}

          {canOrder && (
            <>
              {orderError && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {orderError}
                </div>
              )}
              <form onSubmit={handleOrder} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="order-qty" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Quantity (kg)
                  </label>
                  <input
                    id="order-qty"
                    type="number"
                    required
                    min="0.1"
                    max={listing.quantityKg}
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
                        {formatGhs(Number(orderQty) * listing.pricePerKg)}
                      </span>
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 text-xs text-brand-800">
                  🛡️ Escrow protected: you pay now via Paystack, the farmer only receives the money
                  after you confirm delivery.
                </div>

                <button
                  type="submit"
                  disabled={ordering}
                  className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
                >
                  {ordering ? 'Redirecting…' : 'Pay with Paystack'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/dashboard/marketplace"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-700 transition-colors"
    >
      ← Back to marketplace
    </Link>
  )
}
