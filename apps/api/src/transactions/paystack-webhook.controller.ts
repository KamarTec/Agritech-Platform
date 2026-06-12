import {
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common'
import { Request } from 'express'
import { PaystackService } from './paystack.service'
import { TransactionsService } from './transactions.service'

interface PaystackEvent {
  event: string
  data: { reference: string }
}

@Controller('webhooks/paystack')
export class PaystackWebhookController {
  constructor(
    private readonly paystack: PaystackService,
    private readonly transactionsService: TransactionsService
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature?: string
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody
    if (!rawBody || !this.paystack.isValidWebhookSignature(rawBody, signature)) {
      throw new ForbiddenException('Invalid webhook signature')
    }

    const event = JSON.parse(rawBody.toString()) as PaystackEvent

    if (event.event === 'charge.success' && event.data?.reference) {
      try {
        await this.transactionsService.markHeld(event.data.reference)
      } catch {
        // Unknown reference (e.g. test ping) — acknowledge anyway so Paystack stops retrying.
      }
    }

    return { received: true }
  }
}
