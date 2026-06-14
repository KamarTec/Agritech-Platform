import { Module } from '@nestjs/common'
import { BoostsController } from './boosts.controller'
import { BoostsService } from './boosts.service'
import { PrismaModule } from '../prisma/prisma.module'
import { PaystackService } from '../transactions/paystack.service'

@Module({
  imports: [PrismaModule],
  controllers: [BoostsController],
  providers: [BoostsService, PaystackService],
  exports: [BoostsService],
})
export class BoostsModule {}
