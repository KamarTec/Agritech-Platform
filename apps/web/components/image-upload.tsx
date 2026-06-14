'use client'

import { useRef, useState } from 'react'
import { api, ApiError } from '@/lib/api'

type Purpose = 'avatars' | 'farms' | 'listings' | 'campaigns'

/** Uploads an image to R2 via /uploads/image and reports the public URL. */
export function ImageUpload({
  purpose,
  onUploaded,
  currentUrl,
  label = 'Upload image',
  round,
}: {
  purpose: Purpose
  onUploaded: (url: string) => void
  currentUrl?: string | null
  label?: string
  round?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { url } = await api.upload<{ url: string }>(`/uploads/image?purpose=${purpose}`, 'file', file)
      setPreview(url)
      onUploaded(url)
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setError('Image uploads aren’t configured yet (add Cloudflare R2 keys).')
      } else {
        setError(err instanceof ApiError ? err.message : 'Upload failed. Try again.')
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="preview"
          className={`w-14 h-14 object-cover border border-gray-200 ${round ? 'rounded-full' : 'rounded-lg'}`}
        />
      )}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading…' : preview ? 'Change' : label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleFile}
          className="hidden"
        />
        {error && <p className="mt-1 text-xs text-amber-600 max-w-[220px]">{error}</p>}
      </div>
    </div>
  )
}
