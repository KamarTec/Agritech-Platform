import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Listing, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateListingDto } from './dto/create-listing.dto'
import { UpdateListingDto } from './dto/update-listing.dto'
import { QueryListingsDto } from './dto/query-listings.dto'

const farmSummary = {
  select: { id: true, name: true, location: true, verified: true, farmerId: true },
} as const

export interface PaginatedListings {
  items: Listing[]
  total: number
  page: number
  pages: number
}

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(farmerId: string, dto: CreateListingDto): Promise<Listing> {
    const farm = await this.prisma.farm.findUnique({
      where: { id: dto.farmId },
      select: { farmerId: true },
    })
    if (!farm) {
      throw new NotFoundException('Farm not found')
    }
    if (farm.farmerId !== farmerId) {
      throw new ForbiddenException('You can only create listings for your own farms')
    }

    return this.prisma.listing.create({
      data: {
        farmId: dto.farmId,
        crop: dto.crop.trim(),
        quantityKg: dto.quantityKg,
        pricePerKg: dto.pricePerKg,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : null,
      },
      include: { farm: farmSummary },
    })
  }

  async findMarketplace(query: QueryListingsDto): Promise<PaginatedListings> {
    const page = query.page ?? 1
    const limit = query.limit ?? 12

    const where: Prisma.ListingWhereInput = {
      status: 'ACTIVE',
      ...(query.crop
        ? { crop: { contains: query.crop, mode: 'insensitive' } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { crop: { contains: query.search, mode: 'insensitive' } },
              { farm: { name: { contains: query.search, mode: 'insensitive' } } },
              { farm: { location: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        include: { farm: farmSummary },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ])

    return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) }
  }

  findMine(farmerId: string): Promise<Listing[]> {
    return this.prisma.listing.findMany({
      where: { farm: { farmerId } },
      include: { farm: farmSummary },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string): Promise<Listing> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { farm: farmSummary },
    })
    if (!listing) {
      throw new NotFoundException('Listing not found')
    }
    return listing
  }

  async update(id: string, farmerId: string, dto: UpdateListingDto): Promise<Listing> {
    await this.assertOwnership(id, farmerId)
    return this.prisma.listing.update({
      where: { id },
      data: {
        ...(dto.crop !== undefined ? { crop: dto.crop.trim() } : {}),
        ...(dto.quantityKg !== undefined ? { quantityKg: dto.quantityKg } : {}),
        ...(dto.pricePerKg !== undefined ? { pricePerKg: dto.pricePerKg } : {}),
        ...(dto.harvestDate !== undefined ? { harvestDate: new Date(dto.harvestDate) } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: { farm: farmSummary },
    })
  }

  async remove(id: string, farmerId: string): Promise<{ deleted: true }> {
    await this.assertOwnership(id, farmerId)
    await this.prisma.listing.delete({ where: { id } })
    return { deleted: true }
  }

  private async assertOwnership(listingId: string, farmerId: string): Promise<void> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { farm: { select: { farmerId: true } } },
    })
    if (!listing) {
      throw new NotFoundException('Listing not found')
    }
    if (listing.farm.farmerId !== farmerId) {
      throw new ForbiddenException('You do not own this listing')
    }
  }
}
