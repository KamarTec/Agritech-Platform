'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { MySubscription, SubscribeResult, SubscriptionPlan } from '@/lib/api'
import { formatGhs } from '@/lib/format'

export default function BillingPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <BillingContent />
    </Suspense>
  )
}

function Spinner() {
  return (
    <div className="mt-12 flex justify-center">
      <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState<SubscriptionPlan[] | null>(null)
  const [current, setCurrent] = useState<MySubscription | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [p, me] = await Promise.all([
        api.get<SubscriptionPlan[]>('/subscriptions/plans'),
        api.get<MySubscription>('/subscriptions/me'),
      ])
      setPlans(p)
      setCurrent(me)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load plans.')
      setPlans([])
    }
  }, [])

  // Verify on return from Paystack.
  useEffect(() => {
    const reference = searchParams.get('reference') ?? searchParams.get('trxref')
    async function run(): Promise<void> {
      if (reference) {
        try {
          const me = await api.post<MySubscription>(`/subscriptions/verify/${reference}`, {})
          if (me.status === 'ACTIVE') setNotice(`You're now on ${me.plan?.name}. 🎉`)
        } catch {
          /* non-fatal; list reflects latest state */
        }
      }
      await load()
    }
    run()
  }, [searchParams, load])

  async function subscribe(plan: SubscriptionPlan): Promise<void> {
    setBusyId(plan.id)
    setError(null)
    try {
      const result = await api.post<SubscribeResult>('/subscriptions/subscribe', { planId: plan.id })
      window.location.href = result.authorizationUrl
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start checkout.')
      setBusyId(null)
    }
  }

  const currentName = current?.status === 'ACTIVE' ? current.plan?.name : 'Free'

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Billing & plans</h1>
      <p className="mt-1 text-gray-500">
        You&apos;re on <span className="font-semibold text-gray-900">{currentName ?? 'Free'}</span>
        {current?.currentPeriodEnd && current.status === 'ACTIVE' && (
          <> · renews {new Date(current.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>
        )}
        .
      </p>

      {notice && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-800">{notice}</div>
      )}
      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {plans === null ? (
        <Spinner />
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentName === plan.name
            const isFree = plan.priceGhs <= 0
            return (
              <div
                key={plan.id}
                className={`rounded-2xl bg-white border p-6 flex flex-col ${isCurrent ? 'border-brand-400 ring-1 ring-brand-200' : 'border-gray-200'}`}
              >
                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {isFree ? 'Free' : formatGhs(plan.priceGhs)}
                  {!isFree && <span className="text-sm font-medium text-gray-400"> /mo</span>}
                </div>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-brand-600 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent || isFree || busyId === plan.id}
                  onClick={() => subscribe(plan)}
                  className="mt-5 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                >
                  {isCurrent ? 'Current plan' : isFree ? 'Default plan' : busyId === plan.id ? 'Redirecting…' : 'Upgrade'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
