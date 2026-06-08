import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(email: string, password: string, role: string) {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await this.prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    })

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return { user, token }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.profile.findUnique({
      where: { email },
    })

    if (!user) throw new Error('User not found')

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new Error('Invalid password')

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return { user, token }
  }
}
