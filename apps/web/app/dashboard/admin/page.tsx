'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, ApiError } from '@/lib/api'
import type { AdminMetrics, AdminPerson, DisputeView, Listing } from '@/lib/api'
import { formatGhs } from '@/lib/format'
import { CheckCircleIcon, PackageIcon, ShieldCheckIcon } from '@/components/icons'
import { useUser } from '../user-context'

type Tab = 'overview' | 'disputes' | 'kyc' | 'listings'

export default function AdminPage() {
  const user = useUser()
  const [tab, setTab] = useState<Tab>('overview')
  const [error, setError] = useState<string | null>(null)

  if (user.role !== 'ADMIN') {
    return (
      <div className="max-w-3xl">
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-lg font-bold text-gray-900">Admins only</h1>
          <p className="mt-1 text-gray-500">This area is restricted to platform administrators.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Admin</h1>
      <p className="mt-1 text-gray-500">Platform metrics, dispute resolution, KYC review, and moderation.</p>

      <div className="mt-6 flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {(['overview', 'disputes', 'kyc', 'listings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6">
        {tab === 'overview' && <OverviewTab onError={setError} />}
        {tab === 'disputes' && <DisputesTab onError={setError} />}
        {tab === 'kyc' && <KycTab onError={setError} />}
        {tab === 'listings' && <ListingsTab onError={setError} />}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="mt-8 flex justify-center">
      <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function OverviewTab({ onError }: { onError: (m: string) => void }) {
  const [m, setM] = useState<AdminMetrics | null>(null)
  useEffect(() => {
    api.get<AdminMetrics>('/admin/metrics').then(setM).catch((e) =>
      onError(e instanceof ApiError ? e.message : 'Could not load metrics.')
    )
  }, [onError])

  if (!m) return <Spinner />
  const roleLine = Object.entries(m.usersByRole).map(([r, n]) => `${n} ${r.toLowerCase()}`).join(' · ')

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Metric label="Total users" value={String(m.totalUsers)} sub={roleLine} />
      <Metric label="Listings" value={String(m.listings)} />
      <Metric label="Campaigns" value={String(m.campaigns)} />
      <Metric label="GMV (released)" value={formatGhs(m.gmv)} />
      <Metric label="Held in escrow" value={formatGhs(m.escrowHeld)} />
      <Metric label="Open disputes" value={String(m.openDisputes)} highlight={m.openDisputes > 0} />
      <Metric label="Pending KYC" value={String(m.pendingKyc)} highlight={m.pendingKyc > 0} />
    </div>
  )
}

function Metric({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl bg-white border p-5 ${highlight ? 'border-amber-300' : 'border-gray-200'}`}>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

function DisputesTab({ onError }: { onError: (m: string) => void }) {
  const [disputes, setDisputes] = useState<DisputeView[] | null>(null)

  const load = useCallback(async () => {
    try {
      setDisputes(await api.get<DisputeView[]>('/admin/disputes'))
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Could not load disputes.')
      setDisputes([])
    }
  }, [onError])

  useEffect(() => { load() }, [load])

  async function resolve(id: string, resolution: 'RELEASE' | 'REFUND'): Promise<void> {
    const label = resolution === 'RELEASE' ? 'release the funds to the seller' : 'refund the buyer'
    if (!window.confirm(`Resolve this dispute and ${label}?`)) return
    try {
      await api.post(`/admin/transactions/${id}/resolve`, { resolution })
      await load()
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Could not resolve the dispute.')
    }
  }

  if (!disputes) return <Spinner />
  if (disputes.length === 0) {
    return <Empty icon={<CheckCircleIcon className="w-10 h-10" />} title="No open disputes" body="Disputed escrow orders will appear here for resolution." />
  }

  return (
    <div className="space-y-4">
      {disputes.map(({ transaction: tx, buyer, seller }) => (
        <div key={tx.id} className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900">
                {tx.quantityKg ? `${tx.quantityKg.toLocaleString()} kg ` : ''}{tx.crop ?? tx.type}
                <span className="ml-2 text-sm font-semibold text-red-600">{formatGhs(tx.amount)}</span>
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Buyer: {buyer?.fullName ?? buyer?.email ?? tx.buyerId.slice(0, 8)} · Seller:{' '}
                {seller?.fullName ?? seller?.email ?? tx.sellerId.slice(0, 8)}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {tx.type} order · opened {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => resolve(tx.id, 'RELEASE')}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Release to seller
              </button>
              <button
                onClick={() => resolve(tx.id, 'REFUND')}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                Refund buyer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function KycTab({ onError }: { onError: (m: string) => void }) {
  const [people, setPeople] = useState<AdminPerson[] | null>(null)

  const load = useCallback(async () => {
    try {
      setPeople(await api.get<AdminPerson[]>('/admin/kyc'))
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Could not load the KYC queue.')
      setPeople([])
    }
  }, [onError])

  useEffect(() => { load() }, [load])

  async function decide(userId: string, decision: 'VERIFIED' | 'REJECTED'): Promise<void> {
    try {
      await api.post(`/admin/kyc/${userId}`, { decision })
      await load()
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Could not update verification.')
    }
  }

  if (!people) return <Spinner />
  if (people.length === 0) {
    return <Empty icon={<ShieldCheckIcon className="w-10 h-10" />} title="No pending verifications" body="Users awaiting identity verification will appear here." />
  }

  return (
    <div className="space-y-3">
      {people.map((p) => (
        <div key={p.id} className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-gray-900">{p.fullName ?? p.email}</div>
            <div className="text-sm text-gray-500">{p.email} · <span className="capitalize">{p.role.toLowerCase()}</span></div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => decide(p.id, 'VERIFIED')}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => decide(p.id, 'REJECTED')}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ListingsTab({ onError }: { onError: (m: string) => void }) {
  const [listings, setListings] = useState<Listing[] | null>(null)

  const load = useCallback(async () => {
    try {
      setListings(await api.get<Listing[]>('/admin/listings'))
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Could not load listings.')
      setListings([])
    }
  }, [onError])

  useEffect(() => { load() }, [load])

  async function moderate(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    try {
      await api.post(`/admin/listings/${id}/moderate`, { status })
      await load()
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Could not moderate the listing.')
    }
  }

  if (!listings) return <Spinner />
  if (listings.length === 0) {
    return <Empty icon={<PackageIcon className="w-10 h-10" />} title="No listings" body="Marketplace listings will appear here for moderation." />
  }

  return (
    <div className="space-y-3">
      {listings.map((l) => (
        <div key={l.id} className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-gray-900">
              {l.crop}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                l.status === 'ACTIVE' ? 'bg-brand-50 text-brand-700'
                : l.status === 'SUSPENDED' ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-gray-500'
              }`}>{l.status}</span>
            </div>
            <div className="text-sm text-gray-500">
              {l.farm?.name} · GH₵ {l.pricePerKg.toFixed(2)}/kg · {l.quantityKg.toLocaleString()} kg
            </div>
          </div>
          {l.status === 'SUSPENDED' ? (
            <button
              onClick={() => moderate(l.id, 'ACTIVE')}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Reinstate
            </button>
          ) : (
            <button
              onClick={() => moderate(l.id, 'SUSPENDED')}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              Suspend
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function Empty({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
      <div className="flex justify-center mb-3 text-brand-500">{icon}</div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-gray-500">{body}</p>
    </div>
  )
}
