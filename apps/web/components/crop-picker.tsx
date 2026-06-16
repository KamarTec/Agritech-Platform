'use client'

import { useState } from 'react'
import { CROPS, CROP_CATEGORIES, findCrop } from '@/lib/crops'

export interface CropSelection {
  crop: string
  category: string
}

/**
 * Visual, tap-first crop picker for low-literacy farmers: category tabs +
 * a grid of labelled produce tiles. Picking a tile sets both the crop name
 * and its category. An "Other" tile allows a typed-in crop that isn't listed.
 */
export function CropPicker({
  value,
  onChange,
}: {
  value: CropSelection
  onChange: (selection: CropSelection) => void
}) {
  const matched = findCrop(value.crop)
  const initialCategory = matched?.category ?? value.category ?? CROP_CATEGORIES[0].key
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)

  // A crop the farmer typed that isn't in the catalogue.
  const isCustom = value.crop.trim() !== '' && !matched
  const [customMode, setCustomMode] = useState<boolean>(isCustom)

  const options = CROPS.filter((c) => c.category === activeCategory)

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {CROP_CATEGORIES.map((cat) => {
          const active = cat.key === activeCategory
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Crop tiles */}
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {options.map((opt) => {
          const selected = !customMode && value.crop === opt.label
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setCustomMode(false)
                onChange({ crop: opt.label, category: opt.category })
              }}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2.5 transition-all ${
                selected
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                  : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/40'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={opt.image} alt="" className="w-12 h-12" />
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                {opt.label}
              </span>
            </button>
          )
        })}

        {/* Other / custom */}
        <button
          type="button"
          onClick={() => {
            setCustomMode(true)
            onChange({ crop: '', category: activeCategory })
          }}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed p-2.5 transition-all ${
            customMode
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-300 hover:border-brand-400 text-gray-500'
          }`}
        >
          <span className="w-12 h-12 flex items-center justify-center text-2xl font-light text-gray-400">+</span>
          <span className="text-xs font-semibold text-gray-700 text-center leading-tight">Other</span>
        </button>
      </div>

      {/* Custom name entry */}
      {customMode && (
        <input
          type="text"
          autoFocus
          placeholder="Type the crop name"
          value={value.crop}
          onChange={(e) => onChange({ crop: e.target.value, category: activeCategory })}
          className="mt-3 w-full px-4 py-3 rounded-xl border border-gray-300 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      )}
    </div>
  )
}
