'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Message, ThreadView } from '@/lib/api'
import { timeAgo } from '@/lib/format'
import { useUser } from '../user-context'

const THREADS_POLL_MS = 10_000
const MESSAGES_POLL_MS = 5_000

const inputClasses =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function MessagesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MessagesContent />
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

function MessagesContent() {
  const user = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeId = searchParams.get('t')

  const [threads, setThreads] = useState<ThreadView[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadThreads = useCallback(async () => {
    try {
      setThreads(await api.get<ThreadView[]>('/messages/threads'))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load conversations.')
      setThreads([])
    }
  }, [])

  useEffect(() => {
    loadThreads()
    const timer = setInterval(loadThreads, THREADS_POLL_MS)
    return () => clearInterval(timer)
  }, [loadThreads])

  function openThread(id: string): void {
    router.push(`/dashboard/messages?t=${id}`)
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Messages</h1>
      <p className="mt-1 text-gray-500">Chat directly with farmers and buyers.</p>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 grid md:grid-cols-[300px,1fr] gap-4 h-[70vh]">
        {/* Thread list */}
        <div className="rounded-2xl bg-white border border-gray-200 overflow-y-auto">
          {threads === null && <div className="p-6"><Spinner /></div>}
          {threads !== null && threads.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              <div className="text-2xl mb-2">💬</div>
              No conversations yet. Start one from a listing, campaign, or farm profile.
            </div>
          )}
          {threads?.map((t) => (
            <button
              key={t.id}
              onClick={() => openThread(t.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                t.id === activeId ? 'bg-brand-50/50' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900 truncate">
                  {t.otherUser?.fullName ?? 'FarmLink user'}
                </span>
                {t.unreadCount > 0 && (
                  <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {t.unreadCount}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {t.lastMessage ? t.lastMessage.content : 'No messages yet'}
              </div>
              {t.contextType && (
                <div className="mt-0.5 text-[11px] text-gray-400 capitalize">about a {t.contextType}</div>
              )}
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="rounded-2xl bg-white border border-gray-200 flex flex-col overflow-hidden">
          {activeId ? (
            <Conversation
              key={activeId}
              threadId={activeId}
              userId={user.id}
              otherName={threads?.find((t) => t.id === activeId)?.otherUser?.fullName ?? null}
              onSent={loadThreads}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-400 p-6">
              <div>
                <div className="text-3xl mb-2">✉️</div>
                Select a conversation to start chatting.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Conversation({
  threadId,
  userId,
  otherName,
  onSent,
}: {
  threadId: string
  userId: string
  otherName: string | null
  onSent: () => void
}) {
  const [messages, setMessages] = useState<Message[] | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      setMessages(await api.get<Message[]>(`/messages/threads/${threadId}`))
    } catch {
      setMessages([])
    }
  }, [threadId])

  useEffect(() => {
    load()
    const timer = setInterval(load, MESSAGES_POLL_MS)
    return () => clearInterval(timer)
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setSending(true)
    try {
      const msg = await api.post<Message>(`/messages/threads/${threadId}`, { content })
      setMessages((prev) => [...(prev ?? []), msg])
      setDraft('')
      onSent()
    } catch {
      /* keep draft so the user can retry */
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-100 font-bold text-gray-900">
        {otherName ?? 'Conversation'}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages === null && <Spinner />}
        {messages?.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-8">No messages yet — say hello.</div>
        )}
        {messages?.map((m) => {
          const mine = m.senderId === userId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-[15px] ${
                  mine ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                {m.content}
                <div className={`mt-0.5 text-[10px] ${mine ? 'text-brand-100' : 'text-gray-400'}`}>
                  {timeAgo(m.createdAt)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={inputClasses}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="shrink-0 px-5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </>
  )
}
