import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['FARMER', 'RETAILER', 'INVESTOR', 'SUPPLIER']),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string(),
})

export const CreateFarmSchema = z.object({
  name: z.string().min(1, 'Farm name is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const CreateListingSchema = z.object({
  farmId: z.string().uuid(),
  crop: z.string().min(1, 'Crop is required'),
  quantityKg: z.number().min(0.1, 'Quantity must be greater than 0'),
  pricePerKg: z.number().min(0, 'Price must be non-negative'),
  harvestDate: z.date().optional(),
})

export const CreateCampaignSchema = z.object({
  farmId: z.string().uuid(),
  crop: z.string().min(1, 'Crop is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targetAmount: z.number().min(100, 'Target amount must be at least 100'),
  profitSharePct: z.number().min(0).max(100),
  harvestDate: z.date(),
})

export const CreateInvestmentSchema = z.object({
  campaignId: z.string().uuid(),
  amount: z.number().min(10, 'Minimum investment is 10'),
})

export const CreateDemandSchema = z.object({
  crop: z.string().min(1, 'Crop is required'),
  quantityKg: z.number().min(0.1, 'Quantity must be greater than 0'),
  maxPricePerKg: z.number().min(0),
  deliveryLocation: z.string().min(1, 'Delivery location is required'),
  neededBy: z.date(),
})

export const CreateBidSchema = z.object({
  demandId: z.string().uuid(),
  offeredPrice: z.number().min(0),
  message: z.string().optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateFarmInput = z.infer<typeof CreateFarmSchema>
export type CreateListingInput = z.infer<typeof CreateListingSchema>
export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>
export type CreateInvestmentInput = z.infer<typeof CreateInvestmentSchema>
export type CreateDemandInput = z.infer<typeof CreateDemandSchema>
export type CreateBidInput = z.infer<typeof CreateBidSchema>
