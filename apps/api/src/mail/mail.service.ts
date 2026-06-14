import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private client: Resend | null = null

  constructor(private readonly config: ConfigService) {}

  enabled(): boolean {
    const key = (this.config.get<string>('RESEND_API_KEY') ?? '').trim()
    return Boolean(key) && !key.includes('placeholder')
  }

  private from(): string {
    return this.config.get<string>('MAIL_FROM') ?? 'FarmLink <onboarding@resend.dev>'
  }

  /** Sends an email; degrades to a no-op (logs) when Resend isn't configured. */
  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.enabled()) {
      this.logger.warn(`Mail not configured — skipped "${subject}" to ${to}`)
      return
    }
    try {
      if (!this.client) {
        this.client = new Resend(this.config.get<string>('RESEND_API_KEY') as string)
      }
      await this.client.emails.send({ from: this.from(), to, subject, html })
    } catch (err) {
      // Never let email failures break the calling flow.
      this.logger.error(`Failed to send "${subject}" to ${to}: ${String(err)}`)
    }
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#16a34a">Reset your FarmLink password</h2>
        <p>We received a request to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Reset password</a></p>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>`
    await this.send(to, 'Reset your FarmLink password', html)
  }
}
