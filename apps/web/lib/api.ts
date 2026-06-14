const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface User {
  id: string
  email: string
  role: 'FARMER' | 'RETAILER' | 'INVESTOR' | 'SUPPLIER' | 'ADMIN'
  fullName: string | null
  phone?: string | null
  location?: string | null
  kycStatus: string
  trustScore: number
  avatarUrl: string | null
  createdAt: string
}

export interface AuthResult {
  user: User
  token: string
}

export interface Farm {
  id: string
  farmerId: string
  name: string
  description: string | null
  location: string
  latitude: number | null
  longitude: number | null
  photos: string[]
  verified: boolean
  createdAt: string
  _count?: { listings: number; campaigns: number }
}

export interface FarmSummary {
  id: string
  name: string
  location: string
  verified: boolean
  farmerId: string
}

export type ListingStatus = 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'SUSPENDED'

export interface Listing {
  id: string
  farmId: string
  crop: string
  quantityKg: number
  pricePerKg: number
  harvestDate: string | null
  photos: string[]
  status: ListingStatus
  createdAt: string
  farm: FarmSummary
  boosted?: boolean
}

export interface PaginatedListings {
  items: Listing[]
  total: number
  page: number
  pages: number
}

/** GET /listings/:id includes the farmer on the farm. */
export interface ListingDetail extends Listing {
  farm: FarmSummary & { farmer: PersonSummary }
}

export type DemandStatus = 'OPEN' | 'BIDDING' | 'AWARDED' | 'IN_DELIVERY' | 'COMPLETED'
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface PersonSummary {
  id: string
  fullName: string | null
  location: string | null
  trustScore: number
  kycStatus?: string
}

export interface DemandRequest {
  id: string
  retailerId: string
  crop: string
  quantityKg: number
  maxPricePerKg: number
  deliveryLocation: string
  neededBy: string
  status: DemandStatus
  createdAt: string
  retailer?: PersonSummary
  _count?: { bids: number }
}

export interface Bid {
  id: string
  demandId: string
  farmerId: string
  offeredPrice: number
  message: string | null
  status: BidStatus
  createdAt: string
  farmer?: PersonSummary
  demand?: DemandRequest
}

export interface PaginatedDemands {
  items: DemandRequest[]
  total: number
  page: number
  pages: number
}

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'FUNDED' | 'HARVESTED' | 'SETTLED'
export type InvestmentStatus = 'ACTIVE' | 'RETURNED' | 'PAID_OUT'

export interface CampaignFarm extends FarmSummary {
  farmer?: PersonSummary
}

export interface Campaign {
  id: string
  farmId: string
  crop: string
  description: string
  targetAmount: number
  raisedAmount: number
  profitSharePct: number
  harvestDate: string
  status: CampaignStatus
  photos: string[]
  createdAt: string
  farm: CampaignFarm
  _count?: { investments: number }
}

export interface Investment {
  id: string
  campaignId: string
  investorId: string
  amount: number
  sharePct: number
  status: InvestmentStatus
  createdAt: string
  campaign?: Campaign
}

export interface PaginatedCampaigns {
  items: Campaign[]
  total: number
  page: number
  pages: number
}

export interface Diagnosis {
  healthy: boolean
  issue: string
  issueType: 'disease' | 'pest' | 'nutrient_deficiency' | 'healthy' | 'unknown'
  severity: 'none' | 'mild' | 'moderate' | 'severe'
  confidencePct: number
  summary: string
  treatment: string[]
  prevention: string[]
  estimatedCostGhs: number
}

export interface DiagnosisResult {
  diagnosis: Diagnosis
  remainingThisMonth: number
}

export interface CropDiagnosisRecord {
  id: string
  farmerId: string
  imageUrl: string
  result: Diagnosis
  createdAt: string
}

export type EscrowStatus = 'PENDING' | 'HELD' | 'RELEASED' | 'DISPUTED' | 'REFUNDED'

export interface Transaction {
  id: string
  type: string
  buyerId: string
  sellerId: string
  listingId: string | null
  bidId: string | null
  crop: string | null
  quantityKg: number | null
  amount: number
  platformFee: number
  paystackReference: string | null
  escrowStatus: EscrowStatus
  createdAt: string
}

export interface InitializeOrderResult {
  transactionId: string
  authorizationUrl: string
  reference: string
}

export interface FarmerStats {
  role: 'FARMER'
  farms: number
  activeListings: number
  pendingBids: number
  salesInEscrow: number
  totalEarned: number
}

export interface RetailerStats {
  role: 'RETAILER'
  openDemands: number
  bidsReceived: number
  ordersInEscrow: number
  totalSpent: number
}

export interface InvestorStats {
  role: 'INVESTOR'
  activeInvestments: number
  portfolioValue: number
  campaignsFunded: number
  totalPaidOut: number
}

export interface BasicStats {
  role: 'SUPPLIER' | 'ADMIN'
}

export type OverviewStats = FarmerStats | RetailerStats | InvestorStats | BasicStats

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  read: boolean
  actionUrl: string | null
  createdAt: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  priceGhs: number
  features: string[]
  paystackPlanCode: string | null
}

export interface MySubscription {
  plan: SubscriptionPlan | null
  status: string
  currentPeriodEnd: string | null
}

export interface SubscribeResult {
  authorizationUrl: string
  reference: string
}

export interface BoostResult {
  authorizationUrl: string
  reference: string
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  content: string
  read: boolean
  createdAt: string
}

export interface ThreadView {
  id: string
  contextType: string | null
  contextId: string | null
  updatedAt: string
  otherUser: { id: string; fullName: string | null; role: string } | null
  lastMessage: { content: string; senderId: string; createdAt: string } | null
  unreadCount: number
}

export interface AdminMetrics {
  usersByRole: Record<string, number>
  totalUsers: number
  listings: number
  campaigns: number
  gmv: number
  escrowHeld: number
  openDisputes: number
  pendingKyc: number
}

export interface AdminPerson {
  id: string
  fullName: string | null
  email: string
  role: string
}

export interface DisputeView {
  transaction: Transaction
  buyer: AdminPerson | null
  seller: AdminPerson | null
}

export interface TrustBreakdown {
  score: number
  tier: 'NEW' | 'BRONZE' | 'SILVER' | 'GOLD'
  kycPoints: number
  agePoints: number
  orderPoints: number
  completedOrders: number
  accountAgeDays: number
  kycStatus: string
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('farmlink_token') : null

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const message = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message || `Request failed (${res.status})`
    throw new ApiError(res.status, message)
  }

  return body as T
}

export const api = {
  register(data: {
    email: string
    password: string
    fullName: string
    role: string
  }): Promise<AuthResult> {
    return request<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  login(data: { email: string; password: string }): Promise<AuthResult> {
    return request<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  me(): Promise<User> {
    return request<User>('/auth/me')
  },

  get<T>(path: string): Promise<T> {
    return request<T>(path)
  },

  post<T>(path: string, data: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(data) })
  },

  patch<T>(path: string, data: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(data) })
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },

  /** Multipart upload — browser sets the Content-Type boundary itself. */
  async upload<T>(path: string, field: string, file: File): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('farmlink_token') : null
    const formData = new FormData()
    formData.append(field, file)

    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      const message = Array.isArray(body?.message)
        ? body.message[0]
        : body?.message || `Request failed (${res.status})`
      throw new ApiError(res.status, message)
    }
    return body as T
  },
}
