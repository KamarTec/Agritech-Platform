'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { Notification } from '@/lib/api'
import { timeAgo } from '@/lib/format'

const POLL_MS = 45_000

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<Notification[] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await api.get<{ count: number }>('/notifications/unread-count')
      setUnread(count)
    } catch {
      /* non-critical */
    }
  }, [])

  // Poll unread count.
  useEffect(() => {
    refreshCount()
    const timer = setInterval(refreshCount, POLL_MS)
    return () => clearInterval(timer)
  }, [refreshCount])

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function toggle(): Promise<void> {
    const next = !open
    setOpen(next)
    if (next) {
      try {
        setItems(await api.get<Notification[]>('/notifications'))
      } catch {
        setItems([])
      }
    }
  }

  async function handleClick(n: Notification): Promise<void> {
    if (!n.read) {
      try {
        await api.post(`/notifications/${n.id}/read`, {})
        setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? null)
        setUnread((c) => Math.max(0, c - 1))
      } catch {
        /* non-critical */
      }
    }
    setOpen(false)
    if (n.actionUrl) router.push(n.actionUrl)
  }

  async function markAllRead(): Promise<void> {
    try {
      await api.post('/notifications/read-all', {})
      setItems((prev) => prev?.map((x) => ({ ...x, read: true })) ?? null)
      setUnread(0)
    } catch {
      /* non-critical */
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-gray-900">Notifications</span>
            {(items?.some((x) => !x.read) ?? false) && (
              <button onClick={markAllRead} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items === null && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {items !== null && items.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-400">
                <div className="text-2xl mb-2">🔔</div>
                You&apos;re all caught up.
              </div>
            )}
            {items?.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                  n.read ? '' : 'bg-brand-50/40'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                  <div className={n.read ? 'pl-4' : ''}>
                    <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                    <div className="text-sm text-gray-500">{n.body}</div>
                    <div className="mt-0.5 text-xs text-gray-400">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
