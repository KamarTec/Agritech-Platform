import Link from 'next/link'

/**
 * FarmLink wordmark (KamarTec brand artwork, cropped to a transparent PNG).
 * `dark` sits the mark on a light chip so the green wordmark stays legible
 * on the dark `forest` backgrounds (footer + auth brand panel).
 */
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" aria-label="FarmLink home" className="inline-flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/farmlink-logo.png"
        alt="FarmLink"
        width={567}
        height={255}
        className={`h-8 w-auto ${dark ? 'rounded-lg bg-white/95 px-2.5 py-1.5 shadow-sm' : ''}`}
      />
    </Link>
  )
}
