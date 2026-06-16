export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000))
}

export function formatGhs(amount: number): string {
  return `GH₵ ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export type TrustTier = 'NEW' | 'BRONZE' | 'SILVER' | 'GOLD'

export function trustTier(score: number): { tier: TrustTier; label: string; classes: string } {
  if (score >= 75) return { tier: 'GOLD', label: 'Gold', classes: 'bg-amber-100 text-amber-700' }
  if (score >= 50) return { tier: 'SILVER', label: 'Silver', classes: 'bg-slate-200 text-slate-700' }
  if (score >= 25) return { tier: 'BRONZE', label: 'Bronze', classes: 'bg-orange-100 text-orange-700' }
  return { tier: 'NEW', label: 'New', classes: 'bg-gray-100 text-gray-500' }
}
