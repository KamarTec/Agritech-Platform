'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Farm } from '@/lib/api'
import { ImageUpload } from '@/components/image-upload'
import { useUser } from '../user-context'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

interface FarmForm {
  name: string
  location: string
  description: string
  latitude: string
  longitude: string
}

const emptyForm: FarmForm = { name: '', location: '', description: '', latitude: '', longitude: '' }

export default function FarmsPage() {
  const user = useUser()
  const router = useRouter()
  const [farms, setFarms] = useState<Farm[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Farm | null>(null)
  const [form, setForm] = useState<FarmForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user.role !== 'FARMER') {
      router.replace('/dashboard')
    }
  }, [user.role, router])

  useEffect(() => {
    loadFarms()
  }, [])

  async function loadFarms(): Promise<void> {
    try {
      setFarms(await api.get<Farm[]>('/farms/mine'))
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load farms. Is the API running?')
      setFarms([])
    }
  }

  function openCreate(): void {
    setEditing(null)
    setForm(emptyForm)
    setPhotoUrl(null)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(farm: Farm): void {
    setEditing(farm)
    setForm({
      name: farm.name,
      location: farm.location,
      description: farm.description ?? '',
      latitude: farm.latitude != null ? String(farm.latitude) : '',
      longitude: farm.longitude != null ? String(farm.longitude) : '',
    })
    setPhotoUrl(farm.photos?.[0] ?? null)
    setFormError(null)
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(form.latitude.trim() ? { latitude: Number(form.latitude) } : {}),
      ...(form.longitude.trim() ? { longitude: Number(form.longitude) } : {}),
      ...(photoUrl ? { photos: [photoUrl] } : {}),
    }
    try {
      if (editing) {
        await api.patch(`/farms/${editing.id}`, payload)
      } else {
        await api.post('/farms', payload)
      }
      setModalOpen(false)
      await loadFarms()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not save the farm. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(farm: Farm): Promise<void> {
    const listingCount = farm._count?.listings ?? 0
    const message =
      listingCount > 0
        ? `Delete "${farm.name}"? This will also delete its ${listingCount} listing(s).`
        : `Delete "${farm.name}"?`
    if (!window.confirm(message)) return
    try {
      await api.delete(`/farms/${farm.id}`)
      await loadFarms()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the farm.')
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">My Farms</h1>
          <p className="mt-1 text-gray-500">Register and manage your farms.</p>
        </div>
        <button
          onClick={openCreate}
          className="shrink-0 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-lg shadow-brand-600/20 transition-all"
        >
          + Add farm
        </button>
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {farms === null && (
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {farms !== null && farms.length === 0 && !error && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="text-lg font-bold text-gray-900">No farms yet</h2>
          <p className="mt-1 text-gray-500">Add your first farm to start posting produce listings.</p>
          <button
            onClick={openCreate}
            className="mt-5 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            Add your first farm
          </button>
        </div>
      )}

      {/* Farm cards */}
      {farms !== null && farms.length > 0 && (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{farm.name}</h3>
                    {farm.verified && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span className="truncate">{farm.location}</span>
                  </p>
                </div>
              </div>

              {farm.description && (
                <p className="mt-3 text-sm text-gray-500 line-clamp-2">{farm.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {farm._count?.listings ?? 0} listing{(farm._count?.listings ?? 0) === 1 ? '' : 's'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(farm)}
                    className="px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-brand-500 hover:text-brand-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(farm)}
                    className="px-3 py-1.5 text-sm font-semibold text-red-500 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">
              {editing ? 'Edit farm' : 'Add a farm'}
            </h2>

            {formError && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label htmlFor="farm-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Farm name
                </label>
                <input
                  id="farm-name"
                  type="text"
                  required
                  placeholder="e.g. Kwame Farms"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="farm-location" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  id="farm-location"
                  type="text"
                  required
                  placeholder="e.g. Ejisu, Ashanti Region"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="farm-description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="farm-description"
                  rows={3}
                  placeholder="What do you grow? How big is the farm?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Farm photo <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <ImageUpload purpose="farms" currentUrl={photoUrl} onUploaded={setPhotoUrl} label="Upload photo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="farm-lat" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Latitude <span className="font-normal text-gray-400">(for weather)</span>
                  </label>
                  <input
                    id="farm-lat"
                    type="number"
                    step="any"
                    placeholder="6.69"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="farm-lng" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Longitude <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="farm-lng"
                    type="number"
                    step="any"
                    placeholder="-1.62"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    className={inputClasses}
                  />
                </div>
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
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
