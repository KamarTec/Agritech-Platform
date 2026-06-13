import { trustTier } from '@/lib/format'

/** Small tier pill derived from a 0-100 trust score. */
export function TrustBadge({ score }: { score: number }) {
  const { label, classes } = trustTier(score)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${classes}`}>
      {label} · {score}
    </span>
  )
}
