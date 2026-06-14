import { Module } from '@nestjs/common'
import { ListingsController } from './listings.controller'
import { ListingsService } from './listings.service'
import { PrismaModule } from '../prisma/prisma.module'
import { BoostsModule } from '../boosts/boosts.module'

@Module({
  imports: [PrismaModule, BoostsModule],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
