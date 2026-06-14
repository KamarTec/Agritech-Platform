'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, ApiError } from '@/lib/api'
import type { PriceInsights, PricePoint } from '@/lib/api'
import { formatGhs } from '@/lib/format'

const inputClasses =
  'px-4 py-2.5 rounded-xl border border-gray-300 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow'

export default function PricesPage() {
  const [crops, setCrops] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [crop, setCrop] = useState('')
  const [region, setRegion] = useState('')
  const [series, setSeries] = useState<PricePoint[] | null>(null)
  const [insights, setInsights] = useState<PriceInsights | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function init(): Promise<void> {
      try {
        const [c, r] = await Promise.all([
          api.get<string[]>('/prices/crops'),
          api.get<string[]>('/prices/regions'),
        ])
        if (cancelled) return
        setCrops(c)
        setRegions(r)
        setCrop(c[0] ?? '')
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load price data.')
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!crop) return
    let cancelled = false
    setSeries(null)
    const params = new URLSearchParams({ crop })
    if (region) params.set('region', region)
    Promise.all([
      api.get<PricePoint[]>(`/prices?${params.toString()}`),
      api.get<PriceInsights>(`/prices/insights?crop=${encodeURIComponent(crop)}`),
    ])
      .then(([s, i]) => {
        if (cancelled) return
        setSeries(s)
        setInsights(i)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load prices.')
      })
    return () => { cancelled = true }
  }, [crop, region])

  // When no region is selected, average across regions per month for a clean line.
  const chartData = useMemo(() => {
    if (!series) return []
    const byDate = new Map<string, number[]>()
    for (const p of series) {
      const label = new Date(p.recordedDate).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
      const arr = byDate.get(label) ?? []
      arr.push(p.pricePerKg)
      byDate.set(label, arr)
    }
    return [...byDate.entries()].map(([label, prices]) => ({
      label,
      price: Math.round((prices.reduce((s, v) => s + v, 0) / prices.length) * 100) / 100,
    }))
  }, [series])

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Price Trends</h1>
      <p className="mt-1 text-gray-500">Historical market prices and the best time to sell.</p>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className={inputClasses}>
          {crops.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputClasses}>
          <option value="">All regions (avg)</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Insights */}
      {insights && insights.dataPoints > 0 && (
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-brand-50 border border-brand-200 p-5">
            <div className="text-sm font-medium text-brand-700">Best time to sell</div>
            <div className="mt-1 text-2xl font-bold text-brand-800">{insights.bestMonth}</div>
            <div className="mt-0.5 text-xs text-brand-600">avg {formatGhs(insights.bestMonthAvg)}/kg</div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <div className="text-sm font-medium text-gray-500">Latest avg price</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{formatGhs(insights.latestAvg)}</div>
            <div className="mt-0.5 text-xs text-gray-400">per kg</div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <div className="text-sm font-medium text-gray-500">Cheapest month</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{insights.cheapestMonth}</div>
            <div className="mt-0.5 text-xs text-gray-400">lowest avg — buy / hold</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mt-6 rounded-2xl bg-white border border-gray-200 p-5">
        {series === null ? (
          <div className="h-72 flex justify-center items-center">
            <div className="w-8 h-8 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-72 flex justify-center items-center text-gray-400">No price data for this selection.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip formatter={(v) => [formatGhs(Number(v)), 'Price/kg']} />
              <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
