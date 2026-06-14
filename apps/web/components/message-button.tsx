'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { api, ApiError } from '@/lib/api'

/** Opens (or creates) a 1:1 conversation with the given user, then navigates to it. */
export function MessageButton({
  participantId,
  contextType,
  contextId,
  label = 'Message',
  className,
}: {
  participantId: string
  contextType?: 'listing' | 'campaign' | 'demand' | 'farm'
  contextId?: string
  label?: string
  className?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function open(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const { id } = await api.post<{ id: string }>('/messages/threads', {
        participantId,
        ...(contextType ? { contextType } : {}),
        ...(contextId ? { contextId } : {}),
      })
      router.push(`/dashboard/messages?t=${id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the conversation.')
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={open}
        disabled={loading}
        className={
          className ??
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-brand-400 hover:text-brand-700 disabled:opacity-50 transition-colors'
        }
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-8 8H4l2.5-2.5A8 8 0 1 1 21 12z" />
        </svg>
        {loading ? 'Opening…' : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  )
}
