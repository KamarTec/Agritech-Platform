export type Role = 'FARMER' | 'RETAILER' | 'INVESTOR' | 'SUPPLIER' | 'ADMIN'
export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type ListingStatus = 'ACTIVE' | 'SOLD' | 'EXPIRED'
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'FUNDED' | 'HARVESTED' | 'SETTLED'
export type InvestmentStatus = 'ACTIVE' | 'RETURNED' | 'PAID_OUT'
export type DemandStatus = 'OPEN' | 'BIDDING' | 'AWARDED' | 'IN_DELIVERY' | 'COMPLETED'
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'
export type TransactionType = 'MARKETPLACE' | 'INVESTMENT' | 'INSURANCE'
export type EscrowStatus = 'HELD' | 'RELEASED' | 'DISPUTED' | 'REFUNDED'
export type SubStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'

export interface Profile {
  id: string
  role: Role
  fullName: string
  email: string
  phone?: string
  location?: string
  latitude?: number
  longitude?: number
  kycStatus: KycStatus
  trustScore: number
  avatarUrl?: string
  createdAt: Date
}

export interface Farm {
  id: string
  farmerId: string
  name: string
  description?: string
  location: string
  latitude?: number
  longitude?: number
  photos: string[]
  verified: boolean
  createdAt: Date
}

export interface Listing {
  id: string
  farmId: string
  crop: string
  quantityKg: number
  pricePerKg: number
  harvestDate?: Date
  photos: string[]
  status: ListingStatus
  createdAt: Date
}

export interface Campaign {
  id: string
  farmId: string
  crop: string
  description: string
  targetAmount: number
  raisedAmount: number
  profitSharePct: number
  harvestDate: Date
  status: CampaignStatus
  photos: string[]
  createdAt: Date
}

export interface Investment {
  id: string
  campaignId: string
  investorId: string
  amount: number
  sharePct: number
  paystackReference?: string
  status: InvestmentStatus
  createdAt: Date
}
