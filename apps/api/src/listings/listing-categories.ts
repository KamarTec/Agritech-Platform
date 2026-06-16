/**
 * Produce categories — kept in sync with the frontend catalogue in
 * apps/web/lib/crops.ts (CROP_CATEGORIES keys). Used to validate listing
 * input and marketplace category filters.
 */
export const LISTING_CATEGORIES = [
  'vegetables',
  'fruits',
  'grains',
  'roots',
  'legumes',
  'cash',
  'livestock',
  'herbs',
] as const

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]
