import { Module } from '@nestjs/common'
import { CropDoctorController } from './crop-doctor.controller'
import { CropDoctorService } from './crop-doctor.service'
import { GeminiService } from './gemini.service'
import { PrismaModule } from '../prisma/prisma.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'

@Module({
  imports: [PrismaModule, SubscriptionsModule],
  controllers: [CropDoctorController],
  providers: [CropDoctorService, GeminiService],
})
export class CropDoctorModule {}
