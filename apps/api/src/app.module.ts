import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { FarmsModule } from './farms/farms.module'
import { ListingsModule } from './listings/listings.module'

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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
