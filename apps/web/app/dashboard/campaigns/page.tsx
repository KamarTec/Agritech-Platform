'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { Campaign, CampaignStatus, Farm, Investment, PaginatedCampaigns } from '@/lib/api'
import { ImageUpload } from '@/components/image-upload'
import { BriefcaseIcon, CheckCircleIcon, RocketIcon, SproutIcon } from '@/components/icons'
import { useUser } from '../user-context'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

const statusStyles: Record<CampaignStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-500',
  ACTIVE: 'bg-brand-50 text-brand-700',
  FUNDED: 'bg-blue-50 text-blue-700',
  HARVESTED: 'bg-amber-50 text-amber-600',
  SETTLED: 'bg-gray-100 text-gray-500',
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[status]}`}>
      {status}
    </span>
  )
}

function ProgressBar({ raised, target }: { raised: number; target: number }) {
  const pct = Math.min(100, Math.round((raised / target) * 100))
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-500">
          Raised <span className="font-semibold text-gray-900">GH₵ {raised.toLocaleString()}</span>
        </span>
        <span className="font-semibold text-gray-900">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-400">Target: GH₵ {target.toLocaleString()}</div>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000))
}

export default function CampaignsPage() {
  const user = useUser()
  if (user.role === 'FARMER') return <FarmerView />
  return <InvestorView />
}

/* ================= FARMER VIEW ================= */

interface CampaignForm {
  farmId: string
  crop: string
  description: string
  targetAmount: string
  profitSharePct: string
  harvestDate: string
}

const emptyForm: CampaignForm = {
  farmId: '',
  crop: '',
  description: '',
  targetAmount: '',
  profitSharePct: '',
  harvestDate: '',
}

function FarmerView() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null)
  const [farms, setFarms] = useState<Farm[]>([])
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CampaignForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [mine, myFarms] = await Promise.all([
        api.get<Campaign[]>('/campaigns/mine'),
        api.get<Farm[]>('/farms/mine'),
      ])
      setCampaigns(mine)
      setFarms(myFarms)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load campaigns.')
      setCampaigns([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await api.post('/campaigns', {
        farmId: form.farmId,
        crop: form.crop.trim(),
        description: form.description.trim(),
        targetAmount: Number(form.targetAmount),
        profitSharePct: Number(form.profitSharePct),
        harvestDate: form.harvestDate,
        ...(photoUrl ? { photos: [photoUrl] } : {}),
      })
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not launch the campaign. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function advanceStatus(campaign: Campaign, status: 'HARVESTED' | 'SETTLED'): Promise<void> {
    const label =
      status === 'HARVESTED'
        ? 'Mark this campaign as harvested?'
        : 'Mark as settled? This records investor payouts as completed.'
    if (!window.confirm(label)) return
    try {
      await api.patch(`/campaigns/${campaign.id}/status`, { status })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the campaign.')
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Harvest Campaigns</h1>
          <p className="mt-1 text-gray-500">Raise funding for your season — investors back you for a profit share.</p>
        </div>
        <button
          onClick={() => {
            setForm({ ...emptyForm, farmId: farms[0]?.id ?? '' })
            setPhotoUrl(null)
            setFormError(null)
            setModalOpen(true)
          }}
          disabled={farms.length === 0 && campaigns !== null}
          className="shrink-0 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20 transition-all"
        >
          + Launch campaign
        </button>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {campaigns === null && (
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {campaigns !== null && farms.length === 0 && !error && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <SproutIcon className="w-10 h-10 mx-auto text-brand-500" />
          <h2 className="mt-3 text-lg font-bold text-gray-900">You need a farm first</h2>
          <p className="mt-1 text-gray-500">Add a farm before launching a harvest campaign.</p>
        </div>
      )}

      {campaigns !== null && farms.length > 0 && campaigns.length === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <RocketIcon className="w-10 h-10 mx-auto text-brand-500" />
          <h2 className="mt-3 text-lg font-bold text-gray-900">No campaigns yet</h2>
          <p className="mt-1 text-gray-500">Launch your first campaign and let investors fund your harvest.</p>
        </div>
      )}

      {campaigns !== null && campaigns.length > 0 && (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-2xl bg-white border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="font-bold text-gray-900 hover:text-brand-700 transition-colors"
                  >
                    {campaign.crop} — {campaign.farm.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Harvest {formatDate(campaign.harvestDate)} · {campaign.profitSharePct}% profit share
                  </p>
                </div>
                <StatusBadge status={campaign.status} />
              </div>

              <div className="mt-4">
                <ProgressBar raised={campaign.raisedAmount} target={campaign.targetAmount} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {campaign._count?.investments ?? 0} investor{(campaign._count?.investments ?? 0) === 1 ? '' : 's'}
                </span>
                <div className="flex gap-2">
                  {campaign.status === 'FUNDED' && (
                    <button
                      onClick={() => advanceStatus(campaign, 'HARVESTED')}
                      className="px-3 py-1.5 text-sm font-semibold text-amber-600 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
                    >
                      Mark harvested
                    </button>
                  )}
                  {campaign.status === 'HARVESTED' && (
                    <button
                      onClick={() => advanceStatus(campaign, 'SETTLED')}
                      className="px-3 py-1.5 text-sm font-semibold text-brand-700 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-colors"
                    >
                      Mark settled
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Launch modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setModalOpen(false)} />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">Launch a harvest campaign</h2>

            {formError && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label htmlFor="c-farm" className="block text-sm font-semibold text-gray-700 mb-1.5">Farm</label>
                <select
                  id="c-farm"
                  required
                  value={form.farmId}
                  onChange={(e) => setForm({ ...form, farmId: e.target.value })}
                  className={inputClasses}
                >
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>{farm.name} — {farm.location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="c-crop" className="block text-sm font-semibold text-gray-700 mb-1.5">Crop</label>
                <input
                  id="c-crop"
                  type="text"
                  required
                  placeholder="e.g. Tomatoes"
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="c-desc" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Pitch to investors
                </label>
                <textarea
                  id="c-desc"
                  rows={3}
                  required
                  minLength={20}
                  placeholder="What are you growing, expected yield, and how will the funds be used?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="c-target" className="block text-sm font-semibold text-gray-700 mb-1.5">Target (GH₵)</label>
                  <input
                    id="c-target"
                    type="number"
                    required
                    min="100"
                    step="1"
                    placeholder="5000"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="c-share" className="block text-sm font-semibold text-gray-700 mb-1.5">Profit share (%)</label>
                  <input
                    id="c-share"
                    type="number"
                    required
                    min="1"
                    max="90"
                    step="1"
                    placeholder="20"
                    value={form.profitSharePct}
                    onChange={(e) => setForm({ ...form, profitSharePct: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="c-harvest" className="block text-sm font-semibold text-gray-700 mb-1.5">Expected harvest date</label>
                <input
                  id="c-harvest"
                  type="date"
                  required
                  value={form.harvestDate}
                  onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Campaign photo <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <ImageUpload purpose="campaigns" currentUrl={photoUrl} onUploaded={setPhotoUrl} label="Upload photo" />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Launching…' : 'Launch campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= INVESTOR VIEW ================= */

function InvestorView() {
  const [tab, setTab] = useState<'browse' | 'portfolio'>('browse')
  const [browse, setBrowse] = useState<PaginatedCampaigns | null>(null)
  const [portfolio, setPortfolio] = useState<Investment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [target, setTarget] = useState<Campaign | null>(null)
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [campaigns, investments] = await Promise.all([
        api.get<PaginatedCampaigns>('/campaigns?limit=50'),
        api.get<Investment[]>('/campaigns/portfolio'),
      ])
      setBrowse(campaigns)
      setPortfolio(investments)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load campaigns.')
      setBrowse({ items: [], total: 0, page: 1, pages: 1 })
      setPortfolio([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalInvested = (portfolio ?? []).reduce((sum, inv) => sum + inv.amount, 0)

  async function handleInvest(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!target) return
    setSaving(true)
    setFormError(null)
    try {
      await api.post(`/campaigns/${target.id}/invest`, { amount: Number(amount) })
      setTarget(null)
      await load()
      setTab('portfolio')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not complete the investment. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Harvest Campaigns</h1>
      <p className="mt-1 text-gray-500">Back real harvests and earn a share of the profits.</p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setTab('browse')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'browse' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Browse {browse ? `(${browse.total})` : ''}
        </button>
        <button
          onClick={() => setTab('portfolio')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'portfolio' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My portfolio {portfolio ? `(${portfolio.length})` : ''}
        </button>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {(browse === null || portfolio === null) && (
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Browse */}
      {tab === 'browse' && browse !== null && (
        <div className="mt-6">
          {browse.items.length === 0 && !error && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <SproutIcon className="w-10 h-10 mx-auto text-brand-500" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">No campaigns right now</h2>
              <p className="mt-1 text-gray-500">Farmers launch new harvest campaigns regularly — check back soon.</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {browse.items.map((campaign) => (
              <div key={campaign.id} className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="font-bold text-gray-900 hover:text-brand-700 transition-colors"
                    >
                      {campaign.crop}
                    </Link>
                    <p className="mt-0.5 text-sm text-gray-500 inline-flex items-center gap-1">
                      {campaign.farm.name} · {campaign.farm.location}
                      {campaign.farm.verified && <CheckCircleIcon className="w-4 h-4 text-brand-600" />}
                    </p>
                  </div>
                  <StatusBadge status={campaign.status} />
                </div>

                <Link href={`/dashboard/campaigns/${campaign.id}`} className="block">
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2 hover:text-gray-700 transition-colors">
                    {campaign.description}
                  </p>
                </Link>

                <div className="mt-4">
                  <ProgressBar raised={campaign.raisedAmount} target={campaign.targetAmount} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-gray-50 py-2">
                    <div className="font-bold text-gray-900 text-sm">{campaign.profitSharePct}%</div>
                    <div className="text-[11px] text-gray-400">Profit share</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 py-2">
                    <div className="font-bold text-gray-900 text-sm">{daysUntil(campaign.harvestDate)}d</div>
                    <div className="text-[11px] text-gray-400">To harvest</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 py-2">
                    <div className="font-bold text-gray-900 text-sm">{campaign._count?.investments ?? 0}</div>
                    <div className="text-[11px] text-gray-400">Investors</div>
                  </div>
                </div>

                <button
                  disabled={campaign.status !== 'ACTIVE'}
                  onClick={() => {
                    setTarget(campaign)
                    setAmount('')
                    setFormError(null)
                  }}
                  className="mt-4 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                >
                  {campaign.status === 'ACTIVE' ? 'Invest in this harvest' : 'Fully funded'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {tab === 'portfolio' && portfolio !== null && (
        <div className="mt-6">
          {portfolio.length > 0 && (
            <div className="mb-6 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <div className="text-sm font-medium text-gray-500">Total invested</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">GH₵ {totalInvested.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <div className="text-sm font-medium text-gray-500">Active investments</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {portfolio.filter((i) => i.status === 'ACTIVE').length}
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 p-5">
                <div className="text-sm font-medium text-gray-500">Settled</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {portfolio.filter((i) => i.status === 'PAID_OUT').length}
                </div>
              </div>
            </div>
          )}

          {portfolio.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <BriefcaseIcon className="w-10 h-10 mx-auto text-brand-500" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">No investments yet</h2>
              <p className="mt-1 text-gray-500">Browse active campaigns and back your first harvest.</p>
            </div>
          )}

          <div className="space-y-3">
            {portfolio.map((inv) => (
              <div key={inv.id} className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    {inv.campaign ? `${inv.campaign.crop} — ${inv.campaign.farm.name}` : 'Campaign'}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Invested <span className="font-bold text-gray-900">GH₵ {inv.amount.toLocaleString()}</span>
                    {' '}· {inv.sharePct.toFixed(2)}% of harvest profit
                    {inv.campaign && <> · harvest {formatDate(inv.campaign.harvestDate)}</>}
                  </div>
                </div>
                {inv.campaign && <StatusBadge status={inv.campaign.status} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invest modal */}
      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setTarget(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">Invest in {target.crop}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {target.farm.name} · {target.profitSharePct}% profit share pool · GH₵{' '}
              {(target.targetAmount - target.raisedAmount).toLocaleString()} left to fund
            </p>

            {formError && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleInvest} className="mt-5 space-y-4">
              <div>
                <label htmlFor="inv-amount" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Amount (GH₵)
                </label>
                <input
                  id="inv-amount"
                  type="number"
                  required
                  min="10"
                  max={target.targetAmount - target.raisedAmount}
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
                      {(((Number(amount) / target.targetAmount) * target.profitSharePct) || 0).toFixed(2)}%
                    </span>{' '}
                    of this harvest&apos;s profit.
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
                Demo note: payments are recorded directly for now — Paystack escrow integration is coming next.
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setTarget(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Investing…' : 'Confirm investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
