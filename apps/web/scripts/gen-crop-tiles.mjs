// Generates the crop catalog (lib/crops.ts) and the bundled crop-tile SVGs
// (public/crops/*.svg) from a single source of truth below.
//   node scripts/gen-crop-tiles.mjs
// Tiles are flat-icon: a category-coloured gradient + a white pictograph.
// They render with no Cloudflare R2 keys and double as the default listing
// image when a farmer doesn't upload their own photo. Swap in real photos by
// dropping <key>.jpg into public/crops and pointing CROPS[].image at them.
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const webRoot = join(here, '..')
const cropsDir = join(webRoot, 'public', 'crops')
mkdirSync(cropsDir, { recursive: true })

// category -> { label, from, to } gradient
const CATEGORIES = {
  vegetables: { label: 'Vegetables', from: '#34d399', to: '#15803d' },
  fruits: { label: 'Fruits', from: '#fb923c', to: '#ea580c' },
  grains: { label: 'Grains & Cereals', from: '#fbbf24', to: '#b45309' },
  roots: { label: 'Roots & Tubers', from: '#d97706', to: '#78350f' },
  legumes: { label: 'Legumes', from: '#a3e635', to: '#4d7c0f' },
  cash: { label: 'Cash Crops', from: '#b45309', to: '#451a03' },
  livestock: { label: 'Livestock & Poultry', from: '#fb7185', to: '#be123c' },
  herbs: { label: 'Herbs & Spices', from: '#2dd4bf', to: '#0f766e' },
}

// white pictographs, viewBox 0 0 64 64
const G = {
  round: '<circle cx="32" cy="37" r="16"/><path d="M33 22c1-5 6-8 11-7-1 5-5 9-11 8z"/>',
  bulb: '<path d="M32 18c2 4 11 8 11 19 0 8-5 13-11 13s-11-5-11-13c0-11 9-15 11-19z"/><path d="M32 18c-1-3-4-5-7-5 0 3 3 5 7 5z"/>',
  chili: '<path d="M40 22c4 0 7 3 7 7 0 11-9 21-20 21-4 0-7-2-7-5 0-2 2-4 5-4 7 1 14-6 14-13 0-4 1-6 1-6z"/><path d="M40 22c0-3-1-6-3-8 3 0 6 2 7 5-1 2-2 3-4 3z"/>',
  leafy: '<path d="M32 18c11 0 19 8 19 18 0 9-8 16-19 16s-19-7-19-16c0-10 8-18 19-18z"/><path fill="none" stroke-opacity="0.45" d="M32 20v32M20 31c8 4 16 4 24 0M18 41c9 5 19 5 28 0"/>',
  pod: '<path fill="none" stroke-width="3" d="M18 18c16 1 29 14 30 30-7 1-13-2-18-7-5-4-9-11-11-18-1-3-1-4-1-5z"/><circle cx="27" cy="29" r="2.6"/><circle cx="34" cy="36" r="2.6"/><circle cx="40" cy="42" r="2.6"/>',
  tuber: '<path d="M19 38c-4-9 3-20 13-22 8-2 14 5 12 13-2 9-10 14-17 13-4 0-6-1-8-4z"/><path fill="none" stroke-width="2.4" stroke-opacity="0.6" d="M44 28c3-2 6-2 9-1M21 17c-1-3-1-6 0-8"/>',
  corn: '<path d="M32 12c7 0 11 9 11 21s-4 17-11 17-11-5-11-17 4-21 11-21z"/><path fill="none" stroke-opacity="0.45" d="M26 20c4 2 8 2 12 0M25 28c5 2 9 2 14 0M25 36c5 2 9 2 14 0M25 44c4 2 8 2 13 0M32 14v38"/>',
  grain: '<rect x="30.5" y="16" width="3" height="36" rx="1.5"/><path d="M32 14c3 2 4 6 0 9-4-3-3-7 0-9zM32 22c3 2 4 6 0 9-4-3-3-7 0-9zM41 19c0 4-3 7-7 7 0-4 3-7 7-7zM23 19c0 4 3 7 7 7 0-4-3-7-7-7zM41 28c0 4-3 7-7 7 0-4 3-7 7-7zM23 28c0 4 3 7 7 7 0-4-3-7-7-7z"/>',
  pineapple: '<ellipse cx="32" cy="42" rx="13" ry="15"/><path d="M32 26c-2-7-7-12-7-12 5 1 7 4 7 4s2-3 7-4c0 0-5 5-7 12z"/><path fill="none" stroke-opacity="0.45" d="M22 37l20 13M42 37L22 50M27 33v21M37 33v21"/>',
  banana: '<path d="M15 24c3 13 13 23 28 23 2 0 4-2 3-4-13 0-23-9-25-20-1-2-6-1-6 1z"/><path d="M20 21c3 11 12 19 24 20 2 0 3-2 2-3-11-1-20-8-22-18-1-2-5-1-4 1z"/>',
  avocado: '<path d="M32 14c6 0 9 6 9 11 0 3-1 5-1 8 0 7-3 13-8 13s-8-6-8-13c0-3-1-5-1-8 0-5 3-11 9-11z"/><circle fill="none" stroke-width="3" cx="32" cy="37" r="5"/>',
  melon: '<path d="M13 29h38c0 12-9 21-19 21S13 41 13 29z"/><path fill="none" stroke-width="2.5" d="M13 29h38"/>',
  cocoa: '<path d="M32 14c2-2 6-3 9-2-1 3-4 5-7 5z"/><ellipse cx="32" cy="36" rx="12" ry="18"/><path fill="none" stroke-opacity="0.45" d="M27 20v32M37 20v32M32 18v36"/>',
  berries: '<circle cx="25" cy="30" r="7"/><circle cx="39" cy="27" r="7"/><circle cx="33" cy="41" r="7"/>',
  nut: '<path d="M24 20c11-4 21 3 21 13s-10 17-21 13c7-1 13-6 13-13s-6-12-13-13z"/>',
  palm: '<rect x="30" y="33" width="4" height="20" rx="2"/><path d="M32 33c-9-1-16-7-18-14 9-1 16 4 18 11 2-7 9-12 18-11-2 7-9 13-18 14zM32 31c-2-7-2-14 0-19 2 5 2 12 0 19z"/>',
  leaf: '<path d="M32 52C19 47 14 36 16 17c14-1 27 7 28 23-2 7-7 10-12 12z"/><path fill="none" stroke-width="2.5" d="M22 45 40 24"/>',
  chicken: '<path d="M20 42c-4 0-7-3-7-7 0-7 6-11 13-11 1-5 7-8 7-8 1 3 0 5 0 5 6 1 10 6 10 13 0 8-7 13-15 13-3 0-6-2-8-5z"/><circle fill="none" stroke-width="2.4" cx="30" cy="28" r="1.6"/><path d="M26 17c-1-3 0-6 2-7 1 3 0 6-2 7z"/><path fill="none" stroke-width="2.5" d="M22 46v6M30 47v6"/>',
  egg: '<path d="M32 14c8 0 13 12 13 22 0 8-5 14-13 14s-13-6-13-14c0-10 5-22 13-22z"/>',
  animal: '<ellipse cx="30" cy="34" rx="15" ry="9"/><circle cx="46" cy="28" r="6"/><path fill="none" stroke-width="3" d="M20 42v7M28 43v7M36 43v7M43 42v7M48 24l3-4"/>',
  fish: '<path d="M14 32c6-9 17-11 26-8 4 1 8 4 10 8-2 4-6 7-10 8-9 3-20 1-26-8z"/><path d="M48 24l9-5-2 13 7 4-14-2z"/><circle fill="none" stroke-width="2.5" cx="24" cy="30" r="2"/>',
  herb: '<rect x="30.5" y="22" width="3" height="32" rx="1.5"/><path d="M32 26c5-3 10-3 13 0-3 5-8 5-13 2zM32 26c-5-3-10-3-13 0 3 5 8 5 13 2zM32 36c5-3 10-3 13 0-3 5-8 5-13 2zM32 36c-5-3-10-3-13 0 3 5 8 5 13 2z"/>',
}

// key, label, category, glyph
const CROPS = [
  ['tomatoes', 'Tomatoes', 'vegetables', 'round'],
  ['onions', 'Onions', 'vegetables', 'bulb'],
  ['pepper', 'Pepper', 'vegetables', 'chili'],
  ['garden-eggs', 'Garden Eggs', 'vegetables', 'round'],
  ['okra', 'Okra', 'vegetables', 'pod'],
  ['cabbage', 'Cabbage', 'vegetables', 'leafy'],
  ['carrot', 'Carrot', 'vegetables', 'tuber'],
  ['lettuce', 'Lettuce', 'vegetables', 'leafy'],
  ['mango', 'Mango', 'fruits', 'round'],
  ['pineapple', 'Pineapple', 'fruits', 'pineapple'],
  ['banana', 'Banana', 'fruits', 'banana'],
  ['plantain', 'Plantain', 'fruits', 'banana'],
  ['orange', 'Orange', 'fruits', 'round'],
  ['pawpaw', 'Pawpaw', 'fruits', 'avocado'],
  ['watermelon', 'Watermelon', 'fruits', 'melon'],
  ['avocado', 'Avocado', 'fruits', 'avocado'],
  ['maize', 'Maize', 'grains', 'corn'],
  ['rice', 'Rice', 'grains', 'grain'],
  ['millet', 'Millet', 'grains', 'grain'],
  ['sorghum', 'Sorghum', 'grains', 'grain'],
  ['cassava', 'Cassava', 'roots', 'tuber'],
  ['yam', 'Yam', 'roots', 'tuber'],
  ['cocoyam', 'Cocoyam', 'roots', 'tuber'],
  ['sweet-potato', 'Sweet Potato', 'roots', 'tuber'],
  ['potato', 'Potato', 'roots', 'tuber'],
  ['cowpea', 'Cowpea (Beans)', 'legumes', 'pod'],
  ['groundnut', 'Groundnut', 'legumes', 'nut'],
  ['soybean', 'Soybean', 'legumes', 'pod'],
  ['bambara-beans', 'Bambara Beans', 'legumes', 'pod'],
  ['cocoa', 'Cocoa', 'cash', 'cocoa'],
  ['coffee', 'Coffee', 'cash', 'berries'],
  ['cashew', 'Cashew', 'cash', 'nut'],
  ['oil-palm', 'Oil Palm', 'cash', 'palm'],
  ['shea', 'Shea', 'cash', 'nut'],
  ['cotton', 'Cotton', 'cash', 'leaf'],
  ['rubber', 'Rubber', 'cash', 'leaf'],
  ['poultry', 'Chicken / Poultry', 'livestock', 'chicken'],
  ['eggs', 'Eggs', 'livestock', 'egg'],
  ['goat', 'Goat', 'livestock', 'animal'],
  ['sheep', 'Sheep', 'livestock', 'animal'],
  ['cattle', 'Cattle', 'livestock', 'animal'],
  ['pig', 'Pig', 'livestock', 'animal'],
  ['fish', 'Fish', 'livestock', 'fish'],
  ['ginger', 'Ginger', 'herbs', 'tuber'],
  ['garlic', 'Garlic', 'herbs', 'bulb'],
  ['turmeric', 'Turmeric', 'herbs', 'tuber'],
  ['black-pepper', 'Black Pepper', 'herbs', 'berries'],
  ['lemongrass', 'Lemongrass', 'herbs', 'herb'],
  ['basil', 'Basil', 'herbs', 'herb'],
]

function tile(from, to, glyph) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <g fill="#ffffff" fill-opacity="0.96" stroke="#ffffff" stroke-opacity="0.96" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${G[glyph]}</g>
</svg>
`
}

let count = 0
for (const [key, , cat, glyph] of CROPS) {
  const c = CATEGORIES[cat]
  writeFileSync(join(cropsDir, `${key}.svg`), tile(c.from, c.to, glyph))
  count++
}
// neutral fallback for unknown crops
writeFileSync(join(cropsDir, '_fallback.svg'), tile('#9ca3af', '#4b5563', 'leaf'))

// emit lib/crops.ts
const catLines = Object.entries(CATEGORIES)
  .map(([key, c]) => `  { key: '${key}', label: ${JSON.stringify(c.label)} },`)
  .join('\n')
const cropLines = CROPS.map(
  ([key, label, cat]) =>
    `  { key: '${key}', label: ${JSON.stringify(label)}, category: '${cat}', image: '/crops/${key}.svg' },`
).join('\n')

const ts = `// AUTO-GENERATED by scripts/gen-crop-tiles.mjs — edit there and re-run, not here.
// The crop catalog: the single source of truth for the visual picker, marketplace
// category filters, and default listing images.

export interface CropCategory {
  key: string
  label: string
}

export interface CropOption {
  key: string
  label: string
  category: string
  image: string
}

export const CROP_CATEGORIES: CropCategory[] = [
${catLines}
]

export const CROPS: CropOption[] = [
${cropLines}
]

const BY_LABEL = new Map(CROPS.map((c) => [c.label.toLowerCase(), c]))
const BY_KEY = new Map(CROPS.map((c) => [c.key, c]))

/** Best-effort match of a free-text crop name to a catalogue entry. */
export function findCrop(crop: string | null | undefined): CropOption | undefined {
  if (!crop) return undefined
  const c = crop.trim().toLowerCase()
  if (!c) return undefined
  const exact = BY_LABEL.get(c) ?? BY_KEY.get(c)
  if (exact) return exact
  return CROPS.find((opt) => c.includes(opt.key) || opt.label.toLowerCase().includes(c) || c.includes(opt.label.toLowerCase().split(' ')[0]))
}

/** Resolves a crop name to its tile image, falling back to a neutral tile. */
export function cropImage(crop: string | null | undefined): string {
  return findCrop(crop)?.image ?? '/crops/_fallback.svg'
}

/** Resolves a crop name to its category label (e.g. for display). */
export function cropCategoryLabel(category: string | null | undefined): string {
  if (!category) return 'Other'
  return CROP_CATEGORIES.find((c) => c.key === category)?.label ?? 'Other'
}
`
writeFileSync(join(webRoot, 'lib', 'crops.ts'), ts)
console.log(`wrote ${count} crop tiles + _fallback.svg + lib/crops.ts`)
