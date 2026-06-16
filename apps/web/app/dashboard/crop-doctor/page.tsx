'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { CropDiagnosisRecord, Diagnosis } from '@/lib/api'
import {
  AlertTriangleIcon,
  ClockIcon,
  ImageIcon,
  MicroscopeIcon,
  ShoppingBagIcon,
  StethoscopeIcon,
  XIcon,
} from '@/components/icons'
import { useUser } from '../user-context'

const severityStyles: Record<Diagnosis['severity'], string> = {
  none: 'bg-brand-50 text-brand-700',
  mild: 'bg-amber-50 text-amber-600',
  moderate: 'bg-orange-50 text-orange-600',
  severe: 'bg-red-50 text-red-600',
}

const urgencyStyles: Record<NonNullable<Diagnosis['urgency']>, { label: string; classes: string }> = {
  low: { label: 'Low urgency', classes: 'bg-brand-50 text-brand-700 border-brand-200' },
  medium: { label: 'Act soon', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'Urgent — act today', classes: 'bg-red-50 text-red-700 border-red-200' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Full diagnosis read-out, reused by the live result panel and the history modal. */
function DiagnosisBody({ d }: { d: Diagnosis }) {
  const urgency = d.urgency ? urgencyStyles[d.urgency] : null
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">{d.issue}</h2>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${severityStyles[d.severity]}`}>
          {d.severity}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {d.issueType.replace('_', ' ')} · {d.confidencePct}% confidence
      </p>

      {urgency && (
        <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${urgency.classes}`}>
          {d.urgency === 'high' ? <AlertTriangleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
          {urgency.label}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-600 leading-relaxed">{d.summary}</p>

      {d.immediateActions && d.immediateActions.length > 0 && (
        <div className="mt-5 rounded-xl bg-red-50/60 border border-red-100 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-red-700">
            <AlertTriangleIcon className="w-4 h-4" />
            Do this now
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
            {d.immediateActions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      {d.treatment.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-bold text-gray-900">Treatment</h3>
          <ul className="mt-2 space-y-1.5">
            {d.treatment.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </>
      )}

      {d.products && d.products.length > 0 && (
        <>
          <h3 className="mt-5 flex items-center gap-1.5 text-sm font-bold text-gray-900">
            <ShoppingBagIcon className="w-4 h-4 text-brand-600" />
            What to buy
          </h3>
          <ul className="mt-2 space-y-2">
            {d.products.map((p, i) => (
              <li key={i} className="rounded-xl border border-gray-200 px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                  {typeof p.approxCostGhs === 'number' && p.approxCostGhs > 0 && (
                    <span className="shrink-0 text-xs font-bold text-gray-500">~GH₵ {p.approxCostGhs.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{p.purpose}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      {d.prevention.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-bold text-gray-900">Prevention</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
            {d.prevention.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </>
      )}

      {!d.healthy && (
        <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Estimated treatment cost</span>
          <span className="font-bold text-gray-900">GH₵ {d.estimatedCostGhs.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}

export default function CropDoctorPage() {
  const user = useUser()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [result, setResult] = useState<Diagnosis | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [history, setHistory] = useState<CropDiagnosisRecord[] | null>(null)
  const [selected, setSelected] = useState<CropDiagnosisRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user.role !== 'FARMER') {
      router.replace('/dashboard')
    }
  }, [user.role, router])

  const loadHistory = useCallback(async () => {
    try {
      const data = await api.get<{ items: CropDiagnosisRecord[]; remainingThisMonth: number }>(
        '/crop-doctor/history'
      )
      setHistory(data.items)
      setRemaining(data.remainingThisMonth)
    } catch {
      setHistory([])
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(selectedFile)
  }

  async function handleDiagnose(): Promise<void> {
    if (!file) return
    setDiagnosing(true)
    setError(null)
    try {
      const res = await api.upload<{ diagnosis: Diagnosis; remainingThisMonth: number }>(
        '/crop-doctor/diagnose',
        'image',
        file
      )
      setResult(res.diagnosis)
      setRemaining(res.remainingThisMonth)
      await loadHistory()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not reach the AI service. Please try again.'
      )
    } finally {
      setDiagnosing(false)
    }
  }

  function reset(): void {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            <StethoscopeIcon className="w-7 h-7 text-brand-600" />
            AI Crop Doctor
          </h1>
          <p className="mt-1 text-gray-500">
            Upload a photo of a sick crop — get an instant diagnosis and treatment plan.
          </p>
        </div>
        {remaining !== null && (
          <span className="shrink-0 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold">
            {remaining} free left this month
          </span>
        )}
      </div>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        {/* Upload panel */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={handleFileChange}
          />

          {!preview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-400 hover:bg-brand-50/30 transition-colors flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-brand-600"
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="font-semibold">Click to upload a crop photo</span>
              <span className="text-xs">JPEG, PNG or WEBP · max 8 MB</span>
            </button>
          ) : (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Crop to diagnose"
                className="w-full h-64 object-cover rounded-xl"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={reset}
                  disabled={diagnosing}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors"
                >
                  Change photo
                </button>
                <button
                  onClick={handleDiagnose}
                  disabled={diagnosing}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
                >
                  <MicroscopeIcon className="w-5 h-5" />
                  {diagnosing ? 'Analyzing…' : 'Diagnose'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result panel */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6">
          {diagnosing && (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
              <div className="w-10 h-10 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Our AI agronomist is examining your crop…</p>
            </div>
          )}

          {!diagnosing && !result && (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-12 text-center">
              <MicroscopeIcon className="w-10 h-10 text-gray-300" />
              <p className="text-gray-400 text-sm max-w-xs">
                The diagnosis will appear here — issue, severity, treatment steps, products to buy, and estimated cost.
              </p>
            </div>
          )}

          {!diagnosing && result && <DiagnosisBody d={result} />}
        </div>
      </div>

      {/* History */}
      {history !== null && history.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900">Recent diagnoses</h2>
          <p className="mt-1 text-sm text-gray-400">Tap any to see the photo and the full advice again.</p>
          <div className="mt-4 space-y-3">
            {history.slice(0, 10).map((record) => (
              <button
                key={record.id}
                onClick={() => setSelected(record)}
                className="w-full text-left rounded-2xl bg-white border border-gray-200 px-4 py-3 flex items-center gap-3 hover:border-brand-300 hover:shadow-sm transition-all"
              >
                {record.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={record.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <span className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-300">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">{record.result.issue}</div>
                  <div className="text-sm text-gray-400">
                    {formatDate(record.createdAt)} · {record.result.confidencePct}% confidence
                  </div>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${severityStyles[record.result.severity]}`}>
                  {record.result.severity}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-sm font-medium text-gray-400">{formatDate(selected.createdAt)}</span>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            {selected.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.imageUrl} alt="Diagnosed crop" className="w-full h-52 object-cover rounded-xl mb-5" />
            ) : (
              <div className="w-full h-52 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300 mb-5">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs text-gray-400">Photo not stored for this diagnosis</span>
              </div>
            )}
            <DiagnosisBody d={selected.result} />
          </div>
        </div>
      )}
    </div>
  )
}
