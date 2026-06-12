import { Module } from '@nestjs/common'
import { DemandsController } from './demands.controller'
import { DemandsService } from './demands.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [DemandsController],
  providers: [DemandsService],
  exports: [DemandsService],
})
export class DemandsModule {}
