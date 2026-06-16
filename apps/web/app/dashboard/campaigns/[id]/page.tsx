'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { Campaign, Investment } from '@/lib/api'
import { daysUntil, formatDate, formatGhs } from '@/lib/format'
import { CheckCircleIcon } from '@/components/icons'
import { TrustBadge } from '@/components/trust-badge'
import { MessageButton } from '@/components/message-button'
import { useUser } from '../../user-context'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function CampaignDetailPage() {
  const user = useUser()
  const { id } = useParams<{ id: string }>()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [investing, setInvesting] = useState(false)
  const [investError, setInvestError] = useState<string | null>(null)
  const [investNotice, setInvestNotice] = useState<string | null>(null)

  async function load(): Promise<void> {
    try {
      const result = await api.get<Campaign>(`/campaigns/${id}`)
      setCampaign(result)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this campaign.')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleInvest(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!campaign) return
    setInvesting(true)
    setInvestError(null)
    setInvestNotice(null)
    try {
      await api.post<Investment>(`/campaigns/${campaign.id}/invest`, { amount: Number(amount) })
      setAmount('')
      setInvestNotice('Investment confirmed — track it in your portfolio.')
      await load()
    } catch (err) {
      setInvestError(err instanceof ApiError ? err.message : 'Could not complete the investment. Try again.')
    } finally {
      setInvesting(false)
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

  if (!campaign) {
    return (
      <div className="mt-12 flex justify-center">
        <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const remaining = campaign.targetAmount - campaign.raisedAmount
  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
  const canInvest = user.role === 'INVESTOR' && campaign.status === 'ACTIVE'

  return (
    <div className="max-w-4xl">
      <BackLink />

      <div className="mt-4 grid lg:grid-cols-[1fr,320px] gap-6 items-start">
        {/* Main column */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
            {campaign.photos?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={campaign.photos[0]} alt={campaign.crop} className="h-48 w-full object-cover" />
            )}
            <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{campaign.crop}</h1>
                <p className="mt-1 text-sm text-gray-500 inline-flex items-center gap-1">
                  {campaign.farm.name} · {campaign.farm.location}
                  {campaign.farm.verified && <CheckCircleIcon className="w-4 h-4 text-brand-600" />}
                </p>
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

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">
                  Raised <span className="font-semibold text-gray-900">{formatGhs(campaign.raisedAmount)}</span>
                </span>
                <span className="font-semibold text-gray-900">{pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-400">Target: {formatGhs(campaign.targetAmount)}</div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-gray-50 py-3">
                <div className="font-bold text-gray-900">{campaign.profitSharePct}%</div>
                <div className="text-[11px] text-gray-400">Profit share</div>
              </div>
              <div className="rounded-xl bg-gray-50 py-3">
                <div className="font-bold text-gray-900">{daysUntil(campaign.harvestDate)}d</div>
                <div className="text-[11px] text-gray-400">To harvest</div>
              </div>
              <div className="rounded-xl bg-gray-50 py-3">
                <div className="font-bold text-gray-900">{campaign._count?.investments ?? 0}</div>
                <div className="text-[11px] text-gray-400">Investors</div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">About this harvest</h2>
              <p className="mt-2 text-[15px] text-gray-700 whitespace-pre-line leading-relaxed">
                {campaign.description}
              </p>
              <p className="mt-3 text-sm text-gray-400">Expected harvest {formatDate(campaign.harvestDate)}</p>
            </div>
            </div>
          </div>

          {/* Farm + farmer card */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Run by</h2>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/dashboard/farms/${campaign.farm.id}`}
                  className="font-bold text-gray-900 hover:text-brand-700 transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    {campaign.farm.name}
                    {campaign.farm.verified && <CheckCircleIcon className="w-4 h-4 text-brand-600" />}
                  </span>
                </Link>
                <p className="mt-0.5 text-sm text-gray-500">{campaign.farm.location}</p>
                {campaign.farm.farmer && (
                  <p className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-2">
                    <span>{campaign.farm.farmer.fullName ?? 'Farmer'}</span>
                    <TrustBadge score={campaign.farm.farmer.trustScore} />
                    {campaign.farm.farmer.kycStatus === 'VERIFIED' && (
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                        KYC verified
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <Link
                  href={`/dashboard/farms/${campaign.farm.id}`}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-brand-400 hover:text-brand-700 transition-colors"
                >
                  View farm →
                </Link>
                {campaign.farm.farmer && campaign.farm.farmerId !== user.id && (
                  <MessageButton
                    participantId={campaign.farm.farmer.id}
                    contextType="campaign"
                    contextId={campaign.id}
                    label="Message farmer"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invest box */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900">Invest in this harvest</h2>

          {!canInvest && (
            <p className="mt-3 text-sm text-gray-500">
              {user.role !== 'INVESTOR'
                ? 'Only investors can back campaigns.'
                : 'This campaign is no longer accepting investments.'}
            </p>
          )}

          {canInvest && (
            <>
              {investNotice && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-800">
                  {investNotice}
                </div>
              )}
              {investError && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {investError}
                </div>
              )}
              <p className="mt-3 text-sm text-gray-500">
                {formatGhs(remaining)} left to fund · {campaign.profitSharePct}% profit share pool
              </p>
              <form onSubmit={handleInvest} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="inv-amount" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Amount (GH₵)
                  </label>
                  <input
                    id="inv-amount"
                    type="number"
                    required
                    min="10"
                    max={remaining}
                    step="1"
                    placeholder="200"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={inputClasses}
                  />
                  {Number(amount) >= 10 && (
                    <p className="mt-2 text-sm text-gray-500">
                      You&apos;d own{' '}
                      <span className="font-bold text-brand-700">
                        {(((Number(amount) / campaign.targetAmount) * campaign.profitSharePct) || 0).toFixed(2)}%
                      </span>{' '}
                      of this harvest&apos;s profit.
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={investing}
                  className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
                >
                  {investing ? 'Investing…' : 'Confirm investment'}
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
      href="/dashboard/campaigns"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-700 transition-colors"
    >
      ← Back to campaigns
    </Link>
  )
}
