import { BadRequestException, Injectable } from '@nestjs/common'
import { CropDiagnosis, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { SubscriptionsService } from '../subscriptions/subscriptions.service'
import { Diagnosis, GeminiService } from './gemini.service'

const FREE_MONTHLY_LIMIT = 10
const PRO_MONTHLY_LIMIT = 100

export interface DiagnosisResult {
  diagnosis: Diagnosis
  remainingThisMonth: number
}

@Injectable()
export class CropDoctorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
    private readonly subscriptions: SubscriptionsService
  ) {}

  private async monthlyLimit(farmerId: string): Promise<number> {
    const plan = await this.subscriptions.activePlanName(farmerId)
    return plan ? PRO_MONTHLY_LIMIT : FREE_MONTHLY_LIMIT
  }

  async diagnose(
    farmerId: string,
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<DiagnosisResult> {
    const limit = await this.monthlyLimit(farmerId)
    const usedThisMonth = await this.countThisMonth(farmerId)
    if (usedThisMonth >= limit) {
      throw new BadRequestException(
        `You've used all ${limit} diagnoses this month.` +
          (limit === FREE_MONTHLY_LIMIT ? ' Upgrade to Farmer Pro for more.' : '')
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
      remainingThisMonth: Math.max(0, limit - usedThisMonth - 1),
    }
  }

  async history(farmerId: string): Promise<{ items: CropDiagnosis[]; remainingThisMonth: number }> {
    const [items, usedThisMonth, limit] = await Promise.all([
      this.prisma.cropDiagnosis.findMany({
        where: { farmerId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.countThisMonth(farmerId),
      this.monthlyLimit(farmerId),
    ])
    return { items, remainingThisMonth: Math.max(0, limit - usedThisMonth) }
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
