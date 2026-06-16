'use client'

import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { Bid, DemandRequest, DemandStatus, InitializeOrderResult, PaginatedDemands } from '@/lib/api'
import { CheckIcon, HandshakeIcon, PackageIcon } from '@/components/icons'
import { useUser } from '../user-context'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

const demandStatusStyles: Record<DemandStatus, string> = {
  OPEN: 'bg-brand-50 text-brand-700',
  BIDDING: 'bg-amber-50 text-amber-600',
  AWARDED: 'bg-blue-50 text-blue-700',
  IN_DELIVERY: 'bg-purple-50 text-purple-700',
  COMPLETED: 'bg-gray-100 text-gray-500',
}

function StatusBadge({ status }: { status: DemandStatus }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${demandStatusStyles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DemandsPage() {
  const user = useUser()
  if (user.role === 'RETAILER') return <RetailerView />
  return <FarmerView />
}

/* ================= RETAILER VIEW ================= */

interface DemandForm {
  crop: string
  quantityKg: string
  maxPricePerKg: string
  deliveryLocation: string
  neededBy: string
}

const emptyDemandForm: DemandForm = {
  crop: '',
  quantityKg: '',
  maxPricePerKg: '',
  deliveryLocation: '',
  neededBy: '',
}

function RetailerView() {
  const [demands, setDemands] = useState<DemandRequest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<DemandForm>(emptyDemandForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [bids, setBids] = useState<Record<string, Bid[]>>({})

  const load = useCallback(async () => {
    try {
      setDemands(await api.get<DemandRequest[]>('/demands/mine'))
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your demand requests.')
      setDemands([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleBids(demand: DemandRequest): Promise<void> {
    if (expandedId === demand.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(demand.id)
    if (!bids[demand.id]) {
      try {
        const demandBids = await api.get<Bid[]>(`/demands/${demand.id}/bids`)
        setBids((prev) => ({ ...prev, [demand.id]: demandBids }))
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load bids.')
      }
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await api.post('/demands', {
        crop: form.crop.trim(),
        quantityKg: Number(form.quantityKg),
        maxPricePerKg: Number(form.maxPricePerKg),
        deliveryLocation: form.deliveryLocation.trim(),
        neededBy: form.neededBy,
      })
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not post the request. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function acceptBid(demandId: string, bid: Bid): Promise<void> {
    if (!window.confirm(`Accept this bid of GH₵ ${bid.offeredPrice.toFixed(2)}/kg? Other bids will be rejected.`)) return
    try {
      await api.post(`/demands/bids/${bid.id}/accept`, {})
      const demandBids = await api.get<Bid[]>(`/demands/${demandId}/bids`)
      setBids((prev) => ({ ...prev, [demandId]: demandBids }))
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not accept the bid.')
    }
  }

  async function markCompleted(demand: DemandRequest): Promise<void> {
    if (!window.confirm('Mark this request as completed (delivery received)?')) return
    try {
      await api.patch(`/demands/${demand.id}/status`, { status: 'COMPLETED' })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the request.')
    }
  }

  async function payNow(demand: DemandRequest): Promise<void> {
    try {
      const demandBids = bids[demand.id] ?? (await api.get<Bid[]>(`/demands/${demand.id}/bids`))
      const accepted = demandBids.find((b) => b.status === 'ACCEPTED')
      if (!accepted) {
        setError('No accepted bid found for this request.')
        return
      }
      const total = accepted.offeredPrice * demand.quantityKg
      if (
        !window.confirm(
          `Pay GH₵ ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} into escrow for ${demand.quantityKg.toLocaleString()} kg ${demand.crop}? The farmer is paid once you confirm delivery.`
        )
      )
        return
      const result = await api.post<InitializeOrderResult>('/transactions/initialize-bid', {
        bidId: accepted.id,
      })
      window.location.href = result.authorizationUrl // off to Paystack checkout
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the payment. Try again.')
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Demand Requests</h1>
          <p className="mt-1 text-gray-500">Post what you need — farmers bid, you pick the best offer.</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyDemandForm)
            setFormError(null)
            setModalOpen(true)
          }}
          className="shrink-0 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all"
        >
          + Post request
        </button>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {demands === null && (
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {demands !== null && demands.length === 0 && !error && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <PackageIcon className="w-10 h-10 mx-auto text-brand-500" />
          <h2 className="mt-3 text-lg font-bold text-gray-900">No requests yet</h2>
          <p className="mt-1 text-gray-500">Post your first request and let farmers come to you.</p>
        </div>
      )}

      {demands !== null && demands.length > 0 && (
        <div className="mt-8 space-y-4">
          {demands.map((demand) => (
            <div key={demand.id} className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">
                        {demand.quantityKg.toLocaleString()} kg {demand.crop}
                      </h3>
                      <StatusBadge status={demand.status} />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Max GH₵ {demand.maxPricePerKg.toFixed(2)}/kg · Deliver to {demand.deliveryLocation} · Needed by {formatDate(demand.neededBy)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {demand.status === 'AWARDED' && (
                      <>
                        <button
                          onClick={() => payNow(demand)}
                          className="px-3 py-1.5 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                        >
                          Pay now (escrow)
                        </button>
                        <button
                          onClick={() => markCompleted(demand)}
                          className="px-3 py-1.5 text-sm font-semibold text-brand-700 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-colors"
                        >
                          Mark completed
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleBids(demand)}
                      className="px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-brand-400 hover:text-brand-700 transition-colors"
                    >
                      {demand._count?.bids ?? 0} bid{(demand._count?.bids ?? 0) === 1 ? '' : 's'}
                      {expandedId === demand.id ? ' ▲' : ' ▼'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bids panel */}
              {expandedId === demand.id && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-5">
                  {!bids[demand.id] && (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {bids[demand.id]?.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No bids yet — farmers will see this request in their dashboard.</p>
                  )}
                  {bids[demand.id]?.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{bid.farmer?.fullName ?? 'Farmer'}</span>
                          <span className="text-xs text-gray-400">Trust {bid.farmer?.trustScore ?? 0}/100</span>
                          {bid.status !== 'PENDING' && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bid.status === 'ACCEPTED' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-400'}`}>
                              {bid.status}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          Offers <span className="font-bold text-gray-900">GH₵ {bid.offeredPrice.toFixed(2)}/kg</span>
                          {bid.message && <span className="text-gray-400"> — “{bid.message}”</span>}
                        </div>
                      </div>
                      {bid.status === 'PENDING' && demand.status !== 'AWARDED' && demand.status !== 'COMPLETED' && (
                        <button
                          onClick={() => acceptBid(demand.id, bid)}
                          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
                        >
                          Accept bid
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">Post a demand request</h2>

            {formError && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label htmlFor="demand-crop" className="block text-sm font-semibold text-gray-700 mb-1.5">Crop</label>
                <input
                  id="demand-crop"
                  type="text"
                  required
                  placeholder="e.g. Maize"
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="demand-qty" className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity (kg)</label>
                  <input
                    id="demand-qty"
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    placeholder="500"
                    value={form.quantityKg}
                    onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="demand-price" className="block text-sm font-semibold text-gray-700 mb-1.5">Max price/kg (GH₵)</label>
                  <input
                    id="demand-price"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="3.00"
                    value={form.maxPricePerKg}
                    onChange={(e) => setForm({ ...form, maxPricePerKg: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="demand-location" className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery location</label>
                <input
                  id="demand-location"
                  type="text"
                  required
                  placeholder="e.g. Kejetia Market, Kumasi"
                  value={form.deliveryLocation}
                  onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="demand-needed" className="block text-sm font-semibold text-gray-700 mb-1.5">Needed by</label>
                <input
                  id="demand-needed"
                  type="date"
                  required
                  value={form.neededBy}
                  onChange={(e) => setForm({ ...form, neededBy: e.target.value })}
                  className={inputClasses}
                />
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
                  {saving ? 'Posting…' : 'Post request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= FARMER VIEW ================= */

function FarmerView() {
  const [tab, setTab] = useState<'open' | 'mybids'>('open')
  const [open, setOpen] = useState<PaginatedDemands | null>(null)
  const [myBids, setMyBids] = useState<Bid[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bidTarget, setBidTarget] = useState<DemandRequest | null>(null)
  const [bidPrice, setBidPrice] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [openDemands, bids] = await Promise.all([
        api.get<PaginatedDemands>('/demands?limit=50'),
        api.get<Bid[]>('/demands/bids/mine'),
      ])
      setOpen(openDemands)
      setMyBids(bids)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load demand requests.')
      setOpen({ items: [], total: 0, page: 1, pages: 1 })
      setMyBids([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const biddedDemandIds = new Set((myBids ?? []).filter((b) => b.status === 'PENDING').map((b) => b.demandId))

  async function handleBid(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!bidTarget) return
    setSaving(true)
    setFormError(null)
    try {
      await api.post(`/demands/${bidTarget.id}/bids`, {
        offeredPrice: Number(bidPrice),
        ...(bidMessage.trim() ? { message: bidMessage.trim() } : {}),
      })
      setBidTarget(null)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not place the bid. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Demand Requests</h1>
      <p className="mt-1 text-gray-500">Retailers need produce — bid to supply them.</p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setTab('open')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'open' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Open requests {open ? `(${open.total})` : ''}
        </button>
        <button
          onClick={() => setTab('mybids')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'mybids' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My bids {myBids ? `(${myBids.length})` : ''}
        </button>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {(open === null || myBids === null) && (
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Open requests */}
      {tab === 'open' && open !== null && (
        <div className="mt-6">
          {open.items.length === 0 && !error && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <PackageIcon className="w-10 h-10 mx-auto text-brand-500" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">No open requests right now</h2>
              <p className="mt-1 text-gray-500">Check back soon — retailers post new requests regularly.</p>
            </div>
          )}
          <div className="space-y-4">
            {open.items.map((demand) => (
              <div key={demand.id} className="rounded-2xl bg-white border border-gray-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">
                        {demand.quantityKg.toLocaleString()} kg {demand.crop}
                      </h3>
                      <StatusBadge status={demand.status} />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Up to <span className="font-semibold text-gray-700">GH₵ {demand.maxPricePerKg.toFixed(2)}/kg</span> · {demand.deliveryLocation} · by {formatDate(demand.neededBy)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {demand.retailer?.fullName ?? 'Retailer'} · {demand._count?.bids ?? 0} bid{(demand._count?.bids ?? 0) === 1 ? '' : 's'} so far
                    </p>
                  </div>
                  {biddedDemandIds.has(demand.id) ? (
                    <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold">
                      <CheckIcon className="w-4 h-4" /> Bid placed
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setBidTarget(demand)
                        setBidPrice('')
                        setBidMessage('')
                        setFormError(null)
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
                    >
                      Place bid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My bids */}
      {tab === 'mybids' && myBids !== null && (
        <div className="mt-6">
          {myBids.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <HandshakeIcon className="w-10 h-10 mx-auto text-brand-500" />
              <h2 className="mt-3 text-lg font-bold text-gray-900">No bids yet</h2>
              <p className="mt-1 text-gray-500">Browse open requests and place your first bid.</p>
            </div>
          )}
          <div className="space-y-3">
            {myBids.map((bid) => (
              <div key={bid.id} className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    {bid.demand ? `${bid.demand.quantityKg.toLocaleString()} kg ${bid.demand.crop}` : 'Demand request'}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    Your offer: <span className="font-bold text-gray-900">GH₵ {bid.offeredPrice.toFixed(2)}/kg</span>
                    {bid.demand && <> · needed by {formatDate(bid.demand.neededBy)}</>}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    bid.status === 'ACCEPTED'
                      ? 'bg-brand-100 text-brand-700'
                      : bid.status === 'REJECTED'
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {bid.status === 'PENDING' ? 'AWAITING REPLY' : bid.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bid modal */}
      {bidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setBidTarget(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">
              Bid on {bidTarget.quantityKg.toLocaleString()} kg {bidTarget.crop}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Retailer&apos;s max: GH₵ {bidTarget.maxPricePerKg.toFixed(2)}/kg · {bidTarget.deliveryLocation}
            </p>

            {formError && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleBid} className="mt-5 space-y-4">
              <div>
                <label htmlFor="bid-price" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your price per kg (GH₵)
                </label>
                <input
                  id="bid-price"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder={bidTarget.maxPricePerKg.toFixed(2)}
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="bid-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Message <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="bid-message"
                  rows={3}
                  placeholder="e.g. Fresh harvest available, can deliver by Friday"
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setBidTarget(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Placing…' : 'Place bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
