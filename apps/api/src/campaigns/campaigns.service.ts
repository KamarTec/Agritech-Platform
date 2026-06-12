import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Campaign, Investment, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCampaignDto } from './dto/create-campaign.dto'
import { InvestDto } from './dto/invest.dto'
import { QueryCampaignsDto } from './dto/query-campaigns.dto'

const farmWithFarmer = {
  select: {
    id: true,
    name: true,
    location: true,
    verified: true,
    farmerId: true,
    farmer: { select: { id: true, fullName: true, trustScore: true, kycStatus: true } },
  },
} as const

export interface PaginatedCampaigns {
  items: Campaign[]
  total: number
  page: number
  pages: number
}

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(farmerId: string, dto: CreateCampaignDto): Promise<Campaign> {
    const farm = await this.prisma.farm.findUnique({
      where: { id: dto.farmId },
      select: { farmerId: true },
    })
    if (!farm) {
      throw new NotFoundException('Farm not found')
    }
    if (farm.farmerId !== farmerId) {
      throw new ForbiddenException('You can only create campaigns for your own farms')
    }

    const harvestDate = new Date(dto.harvestDate)
    if (harvestDate <= new Date()) {
      throw new BadRequestException('Harvest date must be in the future')
    }

    return this.prisma.campaign.create({
      data: {
        farmId: dto.farmId,
        crop: dto.crop.trim(),
        description: dto.description.trim(),
        targetAmount: dto.targetAmount,
        profitSharePct: dto.profitSharePct,
        harvestDate,
        status: 'ACTIVE',
      },
      include: { farm: farmWithFarmer, _count: { select: { investments: true } } },
    })
  }

  /** Campaigns investors can browse (active = still raising, funded = fully raised). */
  async findBrowsable(query: QueryCampaignsDto): Promise<PaginatedCampaigns> {
    const page = query.page ?? 1
    const limit = query.limit ?? 12

    const where: Prisma.CampaignWhereInput = {
      status: { in: ['ACTIVE', 'FUNDED'] },
      ...(query.crop ? { crop: { contains: query.crop, mode: 'insensitive' } } : {}),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.campaign.findMany({
        where,
        include: { farm: farmWithFarmer, _count: { select: { investments: true } } },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ])

    return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) }
  }

  findMine(farmerId: string): Promise<Campaign[]> {
    return this.prisma.campaign.findMany({
      where: { farm: { farmerId } },
      include: { farm: farmWithFarmer, _count: { select: { investments: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  /** Investor portfolio: their investments with campaign + farm context. */
  findPortfolio(investorId: string): Promise<Investment[]> {
    return this.prisma.investment.findMany({
      where: { investorId },
      include: {
        campaign: { include: { farm: farmWithFarmer } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { farm: farmWithFarmer, _count: { select: { investments: true } } },
    })
    if (!campaign) {
      throw new NotFoundException('Campaign not found')
    }
    return campaign
  }

  /**
   * Invest in a campaign. sharePct = the investor's slice of the farmer's
   * profit-share pool: (amount / target) * profitSharePct.
   * Campaign flips to FUNDED when the target is reached.
   */
  async invest(campaignId: string, investorId: string, dto: InvestDto): Promise<Investment> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        status: true,
        targetAmount: true,
        raisedAmount: true,
        profitSharePct: true,
        farm: { select: { farmerId: true } },
      },
    })
    if (!campaign) {
      throw new NotFoundException('Campaign not found')
    }
    if (campaign.status !== 'ACTIVE') {
      throw new BadRequestException('This campaign is not accepting investments')
    }
    if (campaign.farm.farmerId === investorId) {
      throw new BadRequestException('You cannot invest in your own campaign')
    }

    const remaining = campaign.targetAmount - campaign.raisedAmount
    if (dto.amount > remaining) {
      throw new BadRequestException(
        `Only GHS ${remaining.toFixed(2)} is left to fund in this campaign`
      )
    }

    const sharePct = (dto.amount / campaign.targetAmount) * campaign.profitSharePct
    const newRaised = campaign.raisedAmount + dto.amount
    const funded = newRaised >= campaign.targetAmount

    const [investment] = await this.prisma.$transaction([
      this.prisma.investment.create({
        data: {
          campaignId,
          investorId,
          amount: dto.amount,
          sharePct: Math.round(sharePct * 100) / 100,
        },
        include: {
          campaign: { include: { farm: farmWithFarmer } },
        },
      }),
      this.prisma.campaign.update({
        where: { id: campaignId },
        data: {
          raisedAmount: newRaised,
          ...(funded ? { status: 'FUNDED' } : {}),
        },
      }),
    ])

    return investment
  }

  /** Farmer moves a funded campaign through harvest and settlement. */
  async updateStatus(
    campaignId: string,
    farmerId: string,
    status: 'HARVESTED' | 'SETTLED'
  ): Promise<Campaign> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { status: true, farm: { select: { farmerId: true } } },
    })
    if (!campaign) {
      throw new NotFoundException('Campaign not found')
    }
    if (campaign.farm.farmerId !== farmerId) {
      throw new ForbiddenException('You do not own this campaign')
    }

    const allowed: Record<string, string[]> = {
      HARVESTED: ['FUNDED'],
      SETTLED: ['HARVESTED'],
    }
    if (!allowed[status].includes(campaign.status)) {
      throw new BadRequestException(
        `A campaign can only be marked ${status} from ${allowed[status].join('/')} (current: ${campaign.status})`
      )
    }

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
      include: { farm: farmWithFarmer, _count: { select: { investments: true } } },
    })

    if (status === 'SETTLED') {
      await this.prisma.investment.updateMany({
        where: { campaignId },
        data: { status: 'PAID_OUT' },
      })
    }

    return updated
  }
}
