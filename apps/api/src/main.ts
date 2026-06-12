import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  app.use(helmet())

  // FRONTEND_URL supports a comma-separated list; values are sanitized in case
  // quotes/whitespace sneak in via dashboard env vars (invalid header chars crash CORS).
  const corsOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/^["']+|["']+$/g, '').replace(/\/+$/, ''))
    .filter(Boolean)

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`FarmLink API running on http://localhost:${port}`)
}

bootstrap()
