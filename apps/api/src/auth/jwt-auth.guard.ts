import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { JwtPayload } from './auth.service'

export interface AuthenticatedRequest extends Request {
  user: JwtPayload
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authentication token')
    }

    const token = authHeader.slice('Bearer '.length)

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token)
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
