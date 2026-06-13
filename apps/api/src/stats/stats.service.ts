import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

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

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string, role: string): Promise<OverviewStats> {
    switch (role) {
      case 'FARMER':
        return this.farmerStats(userId)
      case 'RETAILER':
        return this.retailerStats(userId)
      case 'INVESTOR':
        return this.investorStats(userId)
      default:
        return { role: role === 'SUPPLIER' ? 'SUPPLIER' : 'ADMIN' }
    }
  }

  private async farmerStats(farmerId: string): Promise<FarmerStats> {
    const [farms, activeListings, pendingBids, escrowSum, earnedSum] = await Promise.all([
      this.prisma.farm.count({ where: { farmerId } }),
      this.prisma.listing.count({ where: { farm: { farmerId }, status: 'ACTIVE' } }),
      this.prisma.bid.count({ where: { farmerId, status: 'PENDING' } }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { sellerId: farmerId, escrowStatus: 'HELD' },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { sellerId: farmerId, escrowStatus: 'RELEASED' },
      }),
    ])

    return {
      role: 'FARMER',
      farms,
      activeListings,
      pendingBids,
      salesInEscrow: escrowSum._sum.amount ?? 0,
      totalEarned: earnedSum._sum.amount ?? 0,
    }
  }

  private async retailerStats(retailerId: string): Promise<RetailerStats> {
    const [openDemands, bidsReceived, ordersInEscrow, spentSum] = await Promise.all([
      this.prisma.demandRequest.count({
        where: { retailerId, status: { in: ['OPEN', 'BIDDING'] } },
      }),
      this.prisma.bid.count({ where: { demand: { retailerId }, status: 'PENDING' } }),
      this.prisma.transaction.count({ where: { buyerId: retailerId, escrowStatus: 'HELD' } }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { buyerId: retailerId, escrowStatus: { in: ['HELD', 'RELEASED'] } },
      }),
    ])

    return {
      role: 'RETAILER',
      openDemands,
      bidsReceived,
      ordersInEscrow,
      totalSpent: spentSum._sum.amount ?? 0,
    }
  }

  private async investorStats(investorId: string): Promise<InvestorStats> {
    const [activeInvestments, activeSum, campaigns, paidOutSum] = await Promise.all([
      this.prisma.investment.count({ where: { investorId, status: 'ACTIVE' } }),
      this.prisma.investment.aggregate({
        _sum: { amount: true },
        where: { investorId, status: 'ACTIVE' },
      }),
      this.prisma.investment.groupBy({ by: ['campaignId'], where: { investorId } }),
      this.prisma.investment.aggregate({
        _sum: { amount: true },
        where: { investorId, status: 'PAID_OUT' },
      }),
    ])

    return {
      role: 'INVESTOR',
      activeInvestments,
      portfolioValue: activeSum._sum.amount ?? 0,
      campaignsFunded: campaigns.length,
      totalPaidOut: paidOutSum._sum.amount ?? 0,
    }
  }
}
