'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Farm, Listing, ListingStatus } from '@/lib/api'
import { useUser } from '../layout'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

const statusStyles: Record<ListingStatus, string> = {
  ACTIVE: 'bg-brand-50 text-brand-700',
  SOLD: 'bg-blue-50 text-blue-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
}

interface ListingForm {
  farmId: string
  crop: string
  quantityKg: string
  pricePerKg: string
  harvestDate: string
}

const emptyForm: ListingForm = { farmId: '', crop: '', quantityKg: '', pricePerKg: '', harvestDate: '' }

export default function ListingsPage() {
  const user = useUser()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [farms, setFarms] = useState<Farm[]>([])
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ListingForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (user.role !== 'FARMER') {
      router.replace('/dashboard')
    }
  }, [user.role, router])

  useEffect(() => {
    load()
  }, [])

  async function load(): Promise<void> {
    try {
      const [mine, myFarms] = await Promise.all([
        api.get<Listing[]>('/listings/mine'),
        api.get<Farm[]>('/farms/mine'),
      ])
      setListings(mine)
      setFarms(myFarms)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load listings. Is the API running?')
      setListings([])
    }
  }

  function openCreate(): void {
    setForm({ ...emptyForm, farmId: farms[0]?.id ?? '' })
    setFormError(null)
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await api.post('/listings', {
        farmId: form.farmId,
        crop: form.crop.trim(),
        quantityKg: Number(form.quantityKg),
        pricePerKg: Number(form.pricePerKg),
        ...(form.harvestDate ? { harvestDate: form.harvestDate } : {}),
      })
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not save the listing. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function markStatus(listing: Listing, status: ListingStatus): Promise<void> {
    try {
      await api.patch(`/listings/${listing.id}`, { status })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update the listing.')
    }
  }

  async function handleDelete(listing: Listing): Promise<void> {
    if (!window.confirm(`Delete the ${listing.crop} listing?`)) return
    try {
      await api.delete(`/listings/${listing.id}`)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the listing.')
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">My Listings</h1>
          <p className="mt-1 text-gray-500">Post produce and manage what&apos;s for sale.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={farms.length === 0 && listings !== null}
          className="shrink-0 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20 transition-all"
        >
          + Post listing
        </button>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {listings === null && (
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* No farms yet */}
      {listings !== null && farms.length === 0 && !error && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="text-lg font-bold text-gray-900">You need a farm first</h2>
          <p className="mt-1 text-gray-500">Add a farm before posting produce listings.</p>
          <Link
            href="/dashboard/farms"
            className="inline-block mt-5 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            Add a farm
          </Link>
        </div>
      )}

      {/* Empty listings */}
      {listings !== null && farms.length > 0 && listings.length === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🧺</div>
          <h2 className="text-lg font-bold text-gray-900">No listings yet</h2>
          <p className="mt-1 text-gray-500">Post your first produce listing — buyers are browsing.</p>
          <button
            onClick={openCreate}
            className="mt-5 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            Post your first listing
          </button>
        </div>
      )}

      {/* Listings table */}
      {listings !== null && listings.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase text-xs tracking-wide">
                <th className="px-5 py-3.5 font-semibold">Crop</th>
                <th className="px-5 py-3.5 font-semibold">Farm</th>
                <th className="px-5 py-3.5 font-semibold">Quantity</th>
                <th className="px-5 py-3.5 font-semibold">Price/kg</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                  <td className="px-5 py-4 font-semibold text-gray-900">{listing.crop}</td>
                  <td className="px-5 py-4 text-gray-500">{listing.farm.name}</td>
                  <td className="px-5 py-4 text-gray-700">{listing.quantityKg.toLocaleString()} kg</td>
                  <td className="px-5 py-4 text-gray-700">GH₵ {listing.pricePerKg.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[listing.status]}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {listing.status === 'ACTIVE' && (
                        <button
                          onClick={() => markStatus(listing, 'SOLD')}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          Mark sold
                        </button>
                      )}
                      {listing.status !== 'ACTIVE' && (
                        <button
                          onClick={() => markStatus(listing, 'ACTIVE')}
                          className="px-3 py-1.5 text-xs font-semibold text-brand-700 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 transition-colors"
                        >
                          Re-activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(listing)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">Post a listing</h2>

            {formError && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label htmlFor="listing-farm" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Farm
                </label>
                <select
                  id="listing-farm"
                  required
                  value={form.farmId}
                  onChange={(e) => setForm({ ...form, farmId: e.target.value })}
                  className={inputClasses}
                >
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} — {farm.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="listing-crop" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Crop
                </label>
                <input
                  id="listing-crop"
                  type="text"
                  required
                  placeholder="e.g. Tomatoes"
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="listing-qty" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Quantity (kg)
                  </label>
                  <input
                    id="listing-qty"
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
                  <label htmlFor="listing-price" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Price/kg (GH₵)
                  </label>
                  <input
                    id="listing-price"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="4.50"
                    value={form.pricePerKg}
                    onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="listing-harvest" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Harvest date <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="listing-harvest"
                  type="date"
                  value={form.harvestDate}
                  onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
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
                  {saving ? 'Posting…' : 'Post listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
