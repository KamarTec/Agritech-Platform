import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { createHmac } from 'crypto'

export interface InitializeResult {
  authorizationUrl: string
  reference: string
}

export interface VerifyResult {
  status: 'success' | 'failed' | 'abandoned' | 'pending'
  amountGhs: number
  reference: string
}

const PAYSTACK_BASE = 'https://api.paystack.co'

@Injectable()
export class PaystackService {
  constructor(private readonly config: ConfigService) {}

  private secretKey(): string {
    const key = this.config.get<string>('PAYSTACK_SECRET_KEY')
    if (!key || key.includes('placeholder')) {
      throw new ServiceUnavailableException(
        'Payments are not configured yet (missing Paystack secret key)'
      )
    }
    return key
  }

  async initialize(
    email: string,
    amountGhs: number,
    metadata: Record<string, unknown>,
    callbackUrl?: string
  ): Promise<InitializeResult> {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE}/transaction/initialize`,
        {
          email,
          amount: Math.round(amountGhs * 100), // pesewas
          currency: 'GHS',
          metadata,
          ...(callbackUrl ? { callback_url: callbackUrl } : {}),
        },
        { headers: { Authorization: `Bearer ${this.secretKey()}` }, timeout: 30000 }
      )
      return {
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
      }
    } catch (error) {
      const detail =
        axios.isAxiosError(error) && error.response
          ? JSON.stringify(error.response.data?.message ?? error.response.status)
          : 'network error'
      throw new ServiceUnavailableException(`Could not start payment (${detail})`)
    }
  }

  async verify(reference: string): Promise<VerifyResult> {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${this.secretKey()}` }, timeout: 30000 }
      )
      const data = response.data.data
      return {
        status: data.status,
        amountGhs: data.amount / 100,
        reference: data.reference,
      }
    } catch (error) {
      const detail =
        axios.isAxiosError(error) && error.response
          ? JSON.stringify(error.response.data?.message ?? error.response.status)
          : 'network error'
      throw new ServiceUnavailableException(`Could not verify payment (${detail})`)
    }
  }

  /** Verify the HMAC-SHA512 signature Paystack sends with webhooks. */
  isValidWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
    if (!signature) return false
    const expected = createHmac('sha512', this.secretKey()).update(rawBody).digest('hex')
    return expected === signature
  }
}
