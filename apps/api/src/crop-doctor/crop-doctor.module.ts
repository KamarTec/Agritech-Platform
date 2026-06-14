import { Module } from '@nestjs/common'
import { CropDoctorController } from './crop-doctor.controller'
import { CropDoctorService } from './crop-doctor.service'
import { GeminiService } from './gemini.service'
import { PrismaModule } from '../prisma/prisma.module'
import { SubscriptionsModule } from '../subscriptions/subscriptions.module'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [PrismaModule, SubscriptionsModule, StorageModule],
  controllers: [CropDoctorController],
  providers: [CropDoctorService, GeminiService],
})
export class CropDoctorModule {}
