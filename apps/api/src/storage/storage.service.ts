import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}

@Injectable()
export class StorageService {
  private client: S3Client | null = null

  constructor(private readonly config: ConfigService) {}

  /** True when all R2 credentials are present (and not placeholders). */
  enabled(): boolean {
    const v = (k: string): string => (this.config.get<string>(k) ?? '').trim()
    const account = v('R2_ACCOUNT_ID')
    const key = v('R2_ACCESS_KEY_ID')
    const secret = v('R2_SECRET_ACCESS_KEY')
    const bucket = v('R2_BUCKET_NAME')
    const publicUrl = v('R2_PUBLIC_URL')
    const placeholder = (s: string): boolean => !s || s.startsWith('your-') || s.includes('placeholder')
    return ![account, key, secret, bucket, publicUrl].some(placeholder)
  }

  /** Uploads an image buffer to R2 and returns its public URL. */
  async uploadImage(buffer: Buffer, mimeType: string, prefix: string): Promise<string> {
    if (!this.enabled()) {
      throw new ServiceUnavailableException('Image uploads are not configured yet (missing R2 credentials)')
    }

    const bucket = this.config.get<string>('R2_BUCKET_NAME') as string
    const publicUrl = (this.config.get<string>('R2_PUBLIC_URL') as string).replace(/\/+$/, '')
    const ext = EXT_BY_MIME[mimeType] ?? 'bin'
    const key = `${prefix}/${randomUUID()}.${ext}`

    await this.s3().send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType })
    )

    return `${publicUrl}/${key}`
  }

  private s3(): S3Client {
    if (!this.client) {
      const account = this.config.get<string>('R2_ACCOUNT_ID') as string
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${account}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.config.get<string>('R2_ACCESS_KEY_ID') as string,
          secretAccessKey: this.config.get<string>('R2_SECRET_ACCESS_KEY') as string,
        },
      })
    }
    return this.client
  }
}
