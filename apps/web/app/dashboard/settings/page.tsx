'use client'

import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { TrustBreakdown, User } from '@/lib/api'
import { TrustBadge } from '@/components/trust-badge'
import { useUser, useUpdateUser } from '../user-context'

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function SettingsPage() {
  const user = useUser()
  const updateUser = useUpdateUser()

  // Profile form
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileNotice, setProfileNotice] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Trust score
  const [trust, setTrust] = useState<TrustBreakdown | null>(null)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Older sessions stored the user without phone/location — fetch fresh values.
  useEffect(() => {
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const fresh = await api.me()
        if (cancelled) return
        setFullName(fresh.fullName ?? '')
        setPhone(fresh.phone ?? '')
        setLocation(fresh.location ?? '')
      } catch {
        if (cancelled) return
        setFullName(user.fullName ?? '')
        setPhone(user.phone ?? '')
        setLocation(user.location ?? '')
      } finally {
        if (!cancelled) setProfileLoaded(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recompute and show the trust score breakdown.
  useEffect(() => {
    let cancelled = false
    api
      .get<TrustBreakdown>('/trust/me')
      .then((result) => {
        if (!cancelled) setTrust(result)
      })
      .catch(() => {
        /* trust score is non-critical */
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSavingProfile(true)
    setProfileError(null)
    setProfileNotice(null)
    try {
      const updated = await api.patch<User>('/auth/me', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        location: location.trim(),
      })
      updateUser(updated)
      setProfileNotice('Profile updated.')
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Could not save your profile. Try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setPasswordError(null)
    setPasswordNotice(null)
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    setSavingPassword(true)
    try {
      await api.patch('/auth/password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordNotice('Password changed. Use the new password the next time you sign in.')
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Could not change the password. Try again.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
      <p className="mt-1 text-gray-500">Manage your profile and account security.</p>

      {/* Profile card */}
      <div className="mt-8 rounded-2xl bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900">Profile</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Signed in as <span className="font-semibold text-gray-700">{user.email}</span> ·{' '}
          <span className="capitalize">{user.role.toLowerCase()}</span>
        </p>

        {profileNotice && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-800">
            {profileNotice}
          </div>
        )}
        {profileError && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {profileError}
          </div>
        )}

        {!profileLoaded ? (
          <div className="mt-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
            <div>
              <label htmlFor="set-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                id="set-name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Kwame Mensah"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="set-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="set-phone"
                  type="tel"
                  maxLength={30}
                  placeholder="e.g. 024 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="set-location" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Location <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="set-location"
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Kumasi, Ashanti"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
              >
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Trust score card */}
      <div className="mt-6 rounded-2xl bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Trust score</h2>
          {trust && <TrustBadge score={trust.score} />}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          Earned automatically from your activity. Buyers and investors see this on your profile.
        </p>

        {trust ? (
          <>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">Score</span>
                <span className="font-semibold text-gray-900">{trust.score}/100</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                  style={{ width: `${trust.score}%` }}
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-gray-50 py-3">
                <div className="font-bold text-gray-900">+{trust.kycPoints}</div>
                <div className="text-[11px] text-gray-400">
                  KYC ({trust.kycStatus.toLowerCase()})
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 py-3">
                <div className="font-bold text-gray-900">+{trust.agePoints}</div>
                <div className="text-[11px] text-gray-400">{trust.accountAgeDays}d on FarmLink</div>
              </div>
              <div className="rounded-xl bg-gray-50 py-3">
                <div className="font-bold text-gray-900">+{trust.orderPoints}</div>
                <div className="text-[11px] text-gray-400">
                  {trust.completedOrders} completed order{trust.completedOrders === 1 ? '' : 's'}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Tip: verify your identity and complete orders to climb from Bronze to Gold.
            </p>
          </>
        ) : (
          <div className="mt-6 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Password card */}
      <div className="mt-6 rounded-2xl bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900">Change password</h2>
        <p className="mt-0.5 text-sm text-gray-500">Pick a strong password of at least 8 characters.</p>

        {passwordNotice && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-800">
            {passwordNotice}
          </div>
        )}
        {passwordError && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
          <div>
            <label htmlFor="set-current-pw" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Current password
            </label>
            <input
              id="set-current-pw"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="set-new-pw" className="block text-sm font-semibold text-gray-700 mb-1.5">
                New password
              </label>
              <input
                id="set-new-pw"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="set-confirm-pw" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm new password
              </label>
              <input
                id="set-confirm-pw"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="pt-1">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {savingPassword ? 'Changing…' : 'Change password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
