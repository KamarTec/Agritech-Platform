'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { EscrowStatus, Transaction } from '@/lib/api'
import { useUser } from '../user-context'

const statusStyles: Record<EscrowStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-500',
  HELD: 'bg-amber-50 text-amber-600',
  RELEASED: 'bg-brand-50 text-brand-700',
  DISPUTED: 'bg-red-50 text-red-600',
  REFUNDED: 'bg-blue-50 text-blue-700',
}

const statusLabels: Record<EscrowStatus, string> = {
  PENDING: 'Awaiting payment',
  HELD: 'In escrow',
  RELEASED: 'Released to seller',
  DISPUTED: 'In dispute',
  REFUNDED: 'Refunded',
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersSpinner />}>
      <OrdersContent />
    </Suspense>
  )
}

function OrdersSpinner() {
  return (
    <div className="mt-12 flex justify-center">
      <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function OrdersContent() {
  const user = useUser()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Transaction[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setOrders(await api.get<Transaction[]>('/transactions/mine'))
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your orders.')
      setOrders([])
    }
  }, [])

  // Returning from Paystack checkout: ?reference=xxx (&trxref=xxx)
  useEffect(() => {
    const reference = searchParams.get('reference') ?? searchParams.get('trxref')
    async function verifyAndLoad(): Promise<void> {
      if (reference) {
        try {
          const tx = await api.post<Transaction>(`/transactions/verify/${reference}`, {})
          if (tx.escrowStatus === 'HELD') {
            setNotice('Payment received! The money is held safely in escrow until you confirm delivery.')
          }
        } catch {
          // verification failure is non-fatal; the list will show the latest status
        }
      }
      await load()
    }
    verifyAndLoad()
  }, [searchParams, load])

  async function confirmDelivery(tx: Transaction): Promise<void> {
    if (!window.confirm('Confirm you received the produce? This releases the money to the farmer.')) return
    try {
      await api.post(`/transactions/${tx.id}/confirm-delivery`, {})
      setNotice('Delivery confirmed — payment released to the farmer. 🎉')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not confirm delivery.')
    }
  }

  async function openDispute(tx: Transaction): Promise<void> {
    if (!window.confirm('Open a dispute on this order? Our team will review it.')) return
    try {
      await api.post(`/transactions/${tx.id}/dispute`, {})
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not open the dispute.')
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
      <p className="mt-1 text-gray-500">
        Every payment is held in escrow until the buyer confirms delivery.
      </p>

      {notice && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-800 flex items-center justify-between gap-3">
          {notice}
          <button onClick={() => setNotice(null)} className="text-brand-400 hover:text-brand-700 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders === null && <OrdersSpinner />}

      {orders !== null && orders.length === 0 && !error && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🧾</div>
          <h2 className="text-lg font-bold text-gray-900">No orders yet</h2>
          <p className="mt-1 text-gray-500">
            Order produce from the marketplace — your escrow-protected purchases will appear here.
          </p>
        </div>
      )}

      {orders !== null && orders.length > 0 && (
        <div className="mt-8 space-y-4">
          {orders.map((tx) => {
            const isBuyer = tx.buyerId === user.id
            return (
              <div key={tx.id} className="rounded-2xl bg-white border border-gray-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">
                        {tx.quantityKg ? `${tx.quantityKg.toLocaleString()} kg ` : ''}
                        {tx.crop ?? tx.type}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[tx.escrowStatus]}`}>
                        {statusLabels[tx.escrowStatus]}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                        {isBuyer ? 'BUYING' : 'SELLING'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="font-bold text-gray-900">GH₵ {tx.amount.toLocaleString()}</span>
                      {' '}· placed {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {isBuyer && tx.platformFee > 0 && (
                        <span className="text-gray-400"> · incl. GH₵ {tx.platformFee.toFixed(2)} platform fee</span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {isBuyer && tx.escrowStatus === 'HELD' && (
                      <>
                        <button
                          onClick={() => confirmDelivery(tx)}
                          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
                        >
                          Confirm delivery
                        </button>
                        <button
                          onClick={() => openDispute(tx)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-red-500 text-sm font-semibold hover:border-red-300 hover:bg-red-50 transition-colors"
                        >
                          Dispute
                        </button>
                      </>
                    )}
                    {!isBuyer && tx.escrowStatus === 'HELD' && (
                      <span className="text-sm text-gray-400 self-center">
                        Waiting for buyer to confirm delivery…
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
