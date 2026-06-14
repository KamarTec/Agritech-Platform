import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { FarmsModule } from './farms/farms.module'
import { ListingsModule } from './listings/listings.module'
import { DemandsModule } from './demands/demands.module'
import { CampaignsModule } from './campaigns/campaigns.module'
import { CropDoctorModule } from './crop-doctor/crop-doctor.module'
import { TransactionsModule } from './transactions/transactions.module'
import { StatsModule } from './stats/stats.module'
import { TrustModule } from './trust/trust.module'
import { NotificationsModule } from './notifications/notifications.module'
import { AdminModule } from './admin/admin.module'
import { MessagesModule } from './messages/messages.module'
import { SubscriptionsModule } from './subscriptions/subscriptions.module'
import { BoostsModule } from './boosts/boosts.module'
import { PricesModule } from './prices/prices.module'
import { StorageModule } from './storage/storage.module'
import { WeatherModule } from './weather/weather.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    FarmsModule,
    ListingsModule,
    DemandsModule,
    CampaignsModule,
    CropDoctorModule,
    TransactionsModule,
    StatsModule,
    TrustModule,
    NotificationsModule,
    AdminModule,
    MessagesModule,
    SubscriptionsModule,
    BoostsModule,
    PricesModule,
    StorageModule,
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
