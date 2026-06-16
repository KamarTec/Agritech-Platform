'use client'

import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import type { WeatherResult } from '@/lib/api'
import {
  CloudDrizzleIcon,
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  SnowIcon,
  SunIcon,
  ThermometerIcon,
} from './icons'

const ICON: Record<string, FC<{ className?: string }>> = {
  Clear: SunIcon,
  Clouds: CloudIcon,
  Rain: CloudRainIcon,
  Drizzle: CloudDrizzleIcon,
  Thunderstorm: CloudLightningIcon,
  Snow: SnowIcon,
  Mist: CloudFogIcon,
  Haze: CloudFogIcon,
  Fog: CloudFogIcon,
}

/** 5-day forecast for a farm's coordinates. Renders nothing useful gracefully when unavailable. */
export function WeatherCard({ lat, lng }: { lat: number | null; lng: number | null }) {
  const [data, setData] = useState<WeatherResult | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'unconfigured' | 'error' | 'nocoords'>('loading')

  useEffect(() => {
    if (lat == null || lng == null) {
      setState('nocoords')
      return
    }
    let cancelled = false
    api
      .get<WeatherResult>(`/weather?lat=${lat}&lng=${lng}`)
      .then((r) => { if (!cancelled) { setData(r); setState('ok') } })
      .catch((err) => {
        if (cancelled) return
        setState(err instanceof ApiError && err.status === 503 ? 'unconfigured' : 'error')
      })
    return () => { cancelled = true }
  }, [lat, lng])

  if (state === 'nocoords') return null

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">7-day weather</h2>
      {state === 'loading' && (
        <div className="mt-4 flex justify-center">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {state === 'unconfigured' && (
        <p className="mt-3 text-sm text-gray-400">Weather isn’t configured yet (add an OpenWeather API key).</p>
      )}
      {state === 'error' && <p className="mt-3 text-sm text-gray-400">Couldn’t load the forecast right now.</p>}
      {state === 'ok' && data && (
        <>
          <p className="mt-1 text-sm text-gray-500">{data.location}</p>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {data.days.map((d) => (
              <div key={d.date} className="rounded-xl bg-gray-50 py-3 text-center">
                <div className="text-xs text-gray-400">
                  {new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                </div>
                <div className="text-2xl">{ICON[d.condition] ?? '🌡️'}</div>
                <div className="text-sm font-semibold text-gray-900">{d.tempMax}°</div>
                <div className="text-xs text-gray-400">{d.tempMin}°</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
