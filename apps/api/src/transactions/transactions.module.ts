import { Module } from '@nestjs/common'
import { TransactionsController } from './transactions.controller'
import { PaystackWebhookController } from './paystack-webhook.controller'
import { TransactionsService } from './transactions.service'
import { PaystackService } from './paystack.service'
import { PrismaModule } from '../prisma/prisma.module'
import { TrustModule } from '../trust/trust.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [PrismaModule, TrustModule, NotificationsModule],
  controllers: [TransactionsController, PaystackWebhookController],
  providers: [TransactionsService, PaystackService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
