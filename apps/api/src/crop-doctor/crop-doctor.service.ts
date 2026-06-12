import { BadRequestException, Injectable } from '@nestjs/common'
import { CropDiagnosis, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { Diagnosis, GeminiService } from './gemini.service'

const FREE_MONTHLY_LIMIT = 10

export interface DiagnosisResult {
  diagnosis: Diagnosis
  remainingThisMonth: number
}

@Injectable()
export class CropDoctorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService
  ) {}

  async diagnose(
    farmerId: string,
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<DiagnosisResult> {
    const usedThisMonth = await this.countThisMonth(farmerId)
    if (usedThisMonth >= FREE_MONTHLY_LIMIT) {
      throw new BadRequestException(
        `You've used all ${FREE_MONTHLY_LIMIT} free diagnoses this month. Upgrade to Farmer Pro for more.`
      )
    }

    const diagnosis = await this.gemini.diagnoseCrop(imageBuffer.toString('base64'), mimeType)

    await this.prisma.cropDiagnosis.create({
      data: {
        farmerId,
        imageUrl: '', // photo storage lands with the R2 integration
        result: diagnosis as unknown as Prisma.InputJsonValue,
      },
    })

    return {
      diagnosis,
      remainingThisMonth: FREE_MONTHLY_LIMIT - usedThisMonth - 1,
    }
  }

  async history(farmerId: string): Promise<{ items: CropDiagnosis[]; remainingThisMonth: number }> {
    const [items, usedThisMonth] = await Promise.all([
      this.prisma.cropDiagnosis.findMany({
        where: { farmerId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.countThisMonth(farmerId),
    ])
    return { items, remainingThisMonth: Math.max(0, FREE_MONTHLY_LIMIT - usedThisMonth) }
  }

  private countThisMonth(farmerId: string): Promise<number> {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    return this.prisma.cropDiagnosis.count({
      where: { farmerId, createdAt: { gte: monthStart } },
    })
  }
}
