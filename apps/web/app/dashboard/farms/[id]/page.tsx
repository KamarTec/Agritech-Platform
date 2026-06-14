'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { Campaign, Farm, PaginatedCampaigns, PaginatedListings, PersonSummary } from '@/lib/api'
import { cropEmoji, daysUntil, formatGhs } from '@/lib/format'
import { TrustBadge } from '@/components/trust-badge'
import { MessageButton } from '@/components/message-button'
import { WeatherCard } from '@/components/weather-card'
import { useUser } from '../../user-context'

type FarmProfile = Farm & { farmer?: PersonSummary }

export default function FarmProfilePage() {
  const user = useUser()
  const { id } = useParams<{ id: string }>()
  const [farm, setFarm] = useState<FarmProfile | null>(null)
  const [listings, setListings] = useState<PaginatedListings | null>(null)
  const [campaigns, setCampaigns] = useState<PaginatedCampaigns | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const [farmResult, listingsResult, campaignsResult] = await Promise.all([
          api.get<FarmProfile>(`/farms/${id}`),
          api.get<PaginatedListings>(`/listings?farmId=${id}&limit=12`),
          api.get<PaginatedCampaigns>(`/campaigns?farmId=${id}&limit=12`),
        ])
        if (!cancelled) {
          setFarm(farmResult)
          setListings(listingsResult)
          setCampaigns(campaignsResult)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load this farm.')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (!farm) {
    return (
      <div className="mt-12 flex justify-center">
        <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Farm header */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        {farm.photos?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={farm.photos[0]} alt={farm.name} className="h-40 w-full object-cover" />
        )}
        <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {farm.name}
              {farm.verified && <span className="text-brand-600"> ✓</span>}
            </h1>
            <p className="mt-1 text-gray-500">{farm.location}</p>
          </div>
          {farm.farmer && (
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-right">
              <div className="text-sm font-semibold text-gray-900">{farm.farmer.fullName ?? 'Farmer'}</div>
              <div className="mt-1 flex justify-end">
                <TrustBadge score={farm.farmer.trustScore} />
              </div>
              {farm.farmer.kycStatus === 'VERIFIED' && (
                <span className="mt-1 inline-flex text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  KYC verified
                </span>
              )}
              {farm.farmer.id !== user.id && (
                <div className="mt-2 flex justify-end">
                  <MessageButton participantId={farm.farmer.id} contextType="farm" contextId={farm.id} label="Message" />
                </div>
              )}
            </div>
          )}
        </div>
        {farm.description && (
          <p className="mt-4 text-[15px] text-gray-700 whitespace-pre-line leading-relaxed">
            {farm.description}
          </p>
        )}
        </div>
      </div>

      {/* Weather */}
      <div className="mt-6">
        <WeatherCard lat={farm.latitude} lng={farm.longitude} />
      </div>

      {/* Active listings */}
      <h2 className="mt-8 text-lg font-bold text-gray-900">Active listings</h2>
      {listings && listings.items.length > 0 ? (
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.items.map((listing) => (
            <Link
              key={listing.id}
              href={`/dashboard/marketplace/${listing.id}`}
              className="rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all"
            >
              <div className="h-24 bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                <span className="text-3xl">{cropEmoji(listing.crop)}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{listing.crop}</h3>
                <div className="mt-1 text-sm text-gray-500">
                  GH₵ {listing.pricePerKg.toFixed(2)}/kg · {listing.quantityKg.toLocaleString()} kg
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No active listings right now.</p>
      )}

      {/* Campaigns */}
      <h2 className="mt-8 text-lg font-bold text-gray-900">Harvest campaigns</h2>
      {campaigns && campaigns.items.length > 0 ? (
        <div className="mt-3 space-y-3">
          {campaigns.items.map((campaign: Campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
              className="block rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-md hover:border-brand-200 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900">{campaign.crop}</h3>
                  <div className="mt-0.5 text-sm text-gray-500">
                    {formatGhs(campaign.raisedAmount)} of {formatGhs(campaign.targetAmount)} raised ·{' '}
                    {campaign.profitSharePct}% share · {daysUntil(campaign.harvestDate)}d to harvest
                  </div>
                </div>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                    campaign.status === 'ACTIVE'
                      ? 'bg-brand-50 text-brand-700'
                      : campaign.status === 'FUNDED'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No harvest campaigns right now.</p>
      )}
    </div>
  )
}
