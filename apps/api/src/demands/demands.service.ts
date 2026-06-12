import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Bid, DemandRequest, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateDemandDto } from './dto/create-demand.dto'
import { CreateBidDto } from './dto/create-bid.dto'
import { QueryDemandsDto } from './dto/query-demands.dto'

const retailerSummary = {
  select: { id: true, fullName: true, location: true, trustScore: true },
} as const

const farmerSummary = {
  select: { id: true, fullName: true, location: true, trustScore: true, kycStatus: true },
} as const

export interface PaginatedDemands {
  items: DemandRequest[]
  total: number
  page: number
  pages: number
}

@Injectable()
export class DemandsService {
  constructor(private readonly prisma: PrismaService) {}

  create(retailerId: string, dto: CreateDemandDto): Promise<DemandRequest> {
    return this.prisma.demandRequest.create({
      data: {
        retailerId,
        crop: dto.crop.trim(),
        quantityKg: dto.quantityKg,
        maxPricePerKg: dto.maxPricePerKg,
        deliveryLocation: dto.deliveryLocation.trim(),
        neededBy: new Date(dto.neededBy),
      },
      include: { retailer: retailerSummary, _count: { select: { bids: true } } },
    })
  }

  /** Open demands farmers can bid on. */
  async findOpen(query: QueryDemandsDto): Promise<PaginatedDemands> {
    const page = query.page ?? 1
    const limit = query.limit ?? 12

    const where: Prisma.DemandRequestWhereInput = {
      status: { in: ['OPEN', 'BIDDING'] },
      neededBy: { gte: new Date() },
      ...(query.crop ? { crop: { contains: query.crop, mode: 'insensitive' } } : {}),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.demandRequest.findMany({
        where,
        include: { retailer: retailerSummary, _count: { select: { bids: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.demandRequest.count({ where }),
    ])

    return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) }
  }

  findMine(retailerId: string): Promise<DemandRequest[]> {
    return this.prisma.demandRequest.findMany({
      where: { retailerId },
      include: { _count: { select: { bids: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string): Promise<DemandRequest> {
    const demand = await this.prisma.demandRequest.findUnique({
      where: { id },
      include: { retailer: retailerSummary, _count: { select: { bids: true } } },
    })
    if (!demand) {
      throw new NotFoundException('Demand request not found')
    }
    return demand
  }

  /** Bids on a demand — only the owning retailer may view them. */
  async findBids(demandId: string, retailerId: string): Promise<Bid[]> {
    const demand = await this.prisma.demandRequest.findUnique({
      where: { id: demandId },
      select: { retailerId: true },
    })
    if (!demand) {
      throw new NotFoundException('Demand request not found')
    }
    if (demand.retailerId !== retailerId) {
      throw new ForbiddenException('You can only view bids on your own demand requests')
    }

    return this.prisma.bid.findMany({
      where: { demandId },
      include: { farmer: farmerSummary },
      orderBy: [{ status: 'asc' }, { offeredPrice: 'asc' }],
    })
  }

  async placeBid(demandId: string, farmerId: string, dto: CreateBidDto): Promise<Bid> {
    const demand = await this.prisma.demandRequest.findUnique({
      where: { id: demandId },
      select: { status: true, retailerId: true },
    })
    if (!demand) {
      throw new NotFoundException('Demand request not found')
    }
    if (!['OPEN', 'BIDDING'].includes(demand.status)) {
      throw new BadRequestException('This demand request is no longer accepting bids')
    }

    const existing = await this.prisma.bid.findFirst({
      where: { demandId, farmerId, status: 'PENDING' },
      select: { id: true },
    })
    if (existing) {
      throw new BadRequestException('You already have a pending bid on this request')
    }

    const [bid] = await this.prisma.$transaction([
      this.prisma.bid.create({
        data: {
          demandId,
          farmerId,
          offeredPrice: dto.offeredPrice,
          message: dto.message?.trim() || null,
        },
        include: { farmer: farmerSummary },
      }),
      this.prisma.demandRequest.update({
        where: { id: demandId },
        data: { status: 'BIDDING' },
      }),
    ])

    return bid
  }

  findMyBids(farmerId: string): Promise<Bid[]> {
    return this.prisma.bid.findMany({
      where: { farmerId },
      include: {
        demand: { include: { retailer: retailerSummary } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /** Retailer accepts a bid: bid ACCEPTED, demand AWARDED, other bids REJECTED. */
  async acceptBid(bidId: string, retailerId: string): Promise<Bid> {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { demand: { select: { id: true, retailerId: true, status: true } } },
    })
    if (!bid) {
      throw new NotFoundException('Bid not found')
    }
    if (bid.demand.retailerId !== retailerId) {
      throw new ForbiddenException('You can only accept bids on your own demand requests')
    }
    if (bid.demand.status === 'AWARDED' || bid.demand.status === 'COMPLETED') {
      throw new BadRequestException('This demand request has already been awarded')
    }

    const [accepted] = await this.prisma.$transaction([
      this.prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
        include: { farmer: farmerSummary },
      }),
      this.prisma.bid.updateMany({
        where: { demandId: bid.demand.id, id: { not: bidId }, status: 'PENDING' },
        data: { status: 'REJECTED' },
      }),
      this.prisma.demandRequest.update({
        where: { id: bid.demand.id },
        data: { status: 'AWARDED' },
      }),
    ])

    return accepted
  }

  /** Owner closes out an awarded demand (delivery done) or cancels an open one. */
  async updateStatus(
    demandId: string,
    retailerId: string,
    status: 'COMPLETED' | 'OPEN'
  ): Promise<DemandRequest> {
    const demand = await this.prisma.demandRequest.findUnique({
      where: { id: demandId },
      select: { retailerId: true, status: true },
    })
    if (!demand) {
      throw new NotFoundException('Demand request not found')
    }
    if (demand.retailerId !== retailerId) {
      throw new ForbiddenException('You do not own this demand request')
    }
    if (status === 'COMPLETED' && demand.status !== 'AWARDED') {
      throw new BadRequestException('Only awarded requests can be completed')
    }

    return this.prisma.demandRequest.update({
      where: { id: demandId },
      data: { status },
      include: { _count: { select: { bids: true } } },
    })
  }
}
