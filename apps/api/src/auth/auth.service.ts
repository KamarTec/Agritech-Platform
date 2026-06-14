import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

export interface JwtPayload {
  sub: string
  email: string
  role: string
}

export interface SafeProfile {
  id: string
  email: string
  role: string
  fullName: string | null
  phone: string | null
  location: string | null
  kycStatus: string
  trustScore: number
  avatarUrl: string | null
  createdAt: Date
}

export interface AuthResult {
  user: SafeProfile
  token: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim()

    const existing = await this.prisma.profile.findUnique({ where: { email } })
    if (existing) {
      throw new ConflictException('An account with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName: dto.fullName.trim(),
        role: dto.role,
      },
    })

    return { user: this.sanitize(user), token: this.signToken(user) }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim()

    const user = await this.prisma.profile.findUnique({ where: { email } })
    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password)
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password')
    }

    return { user: this.sanitize(user), token: this.signToken(user) }
  }

  async me(userId: string): Promise<SafeProfile> {
    const user = await this.prisma.profile.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return this.sanitize(user)
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<SafeProfile> {
    const user = await this.prisma.profile.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName.trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
        ...(dto.location !== undefined ? { location: dto.location.trim() || null } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl || null } : {}),
      },
    })
    return this.sanitize(user)
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ changed: true }> {
    const user = await this.prisma.profile.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const passwordValid = await bcrypt.compare(dto.currentPassword, user.password)
    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.profile.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { changed: true }
  }

  /** Always returns 200 (no user enumeration). Emails a reset link when the user exists. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ ok: true }> {
    const email = dto.email.toLowerCase().trim()
    const user = await this.prisma.profile.findUnique({ where: { email } })

    if (user) {
      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await this.prisma.profile.update({
        where: { id: user.id },
        data: { passwordResetToken: tokenHash, passwordResetExpires: expires },
      })

      const frontendUrl = (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000')
        .split(',')[0]
        .trim()
      await this.mail.sendPasswordReset(email, `${frontendUrl}/auth/reset?token=${rawToken}`)
    }

    return { ok: true }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ reset: true }> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex')
    const user = await this.prisma.profile.findFirst({
      where: { passwordResetToken: tokenHash, passwordResetExpires: { gt: new Date() } },
    })
    if (!user) {
      throw new BadRequestException('This reset link is invalid or has expired')
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.profile.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordResetToken: null, passwordResetExpires: null },
    })

    return { reset: true }
  }

  private signToken(user: { id: string; email: string; role: string }): string {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role }
    return this.jwtService.sign(payload)
  }

  private sanitize(user: {
    id: string
    email: string
    role: string
    fullName: string | null
    phone: string | null
    location: string | null
    kycStatus: string
    trustScore: number
    avatarUrl: string | null
    createdAt: Date
  }): SafeProfile {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      kycStatus: user.kycStatus,
      trustScore: user.trustScore,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    }
  }
}
