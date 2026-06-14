import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
import { Notification } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { NotificationsService } from './notifications.service'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload): Promise<Notification[]> {
    return this.notifications.list(user.sub)
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: JwtPayload): Promise<{ count: number }> {
    return this.notifications.unreadCount(user.sub)
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: JwtPayload): Promise<{ updated: number }> {
    return this.notifications.markAllRead(user.sub)
  }

  @Post(':id/read')
  markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ): Promise<Notification> {
    return this.notifications.markRead(id, user.sub)
  }
}
