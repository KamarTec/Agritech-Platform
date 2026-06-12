import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Farm } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFarmDto } from './dto/create-farm.dto'
import { UpdateFarmDto } from './dto/update-farm.dto'

export type FarmWithCounts = Farm & { _count: { listings: number; campaigns: number } }

@Injectable()
export class FarmsService {
  constructor(private readonly prisma: PrismaService) {}

  create(farmerId: string, dto: CreateFarmDto): Promise<Farm> {
    return this.prisma.farm.create({
      data: { ...dto, farmerId },
    })
  }

  findMine(farmerId: string): Promise<FarmWithCounts[]> {
    return this.prisma.farm.findMany({
      where: { farmerId },
      include: { _count: { select: { listings: true, campaigns: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string): Promise<Farm> {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: {
        farmer: { select: { id: true, fullName: true, trustScore: true, kycStatus: true } },
        _count: { select: { listings: true, campaigns: true } },
      },
    })
    if (!farm) {
      throw new NotFoundException('Farm not found')
    }
    return farm
  }

  async update(id: string, farmerId: string, dto: UpdateFarmDto): Promise<Farm> {
    await this.assertOwnership(id, farmerId)
    return this.prisma.farm.update({ where: { id }, data: dto })
  }

  async remove(id: string, farmerId: string): Promise<{ deleted: true }> {
    await this.assertOwnership(id, farmerId)
    await this.prisma.farm.delete({ where: { id } })
    return { deleted: true }
  }

  private async assertOwnership(farmId: string, farmerId: string): Promise<void> {
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
      select: { farmerId: true },
    })
    if (!farm) {
      throw new NotFoundException('Farm not found')
    }
    if (farm.farmerId !== farmerId) {
      throw new ForbiddenException('You do not own this farm')
    }
  }
}
