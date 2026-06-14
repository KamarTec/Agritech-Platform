import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Notification } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

export interface CreateNotificationInput {
  userId: string
  type: string
  title: string
  body: string
  actionUrl?: string
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Emit a notification; best-effort so it never blocks the calling flow. */
  async notifyQuietly(input: CreateNotificationInput): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
          actionUrl: input.actionUrl ?? null,
        },
      })
    } catch {
      // notifications are non-critical
    }
  }

  list(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({ where: { userId, read: false } })
    return { count }
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({ where: { id } })
    if (!notification) {
      throw new NotFoundException('Notification not found')
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('This notification is not yours')
    }
    return this.prisma.notification.update({ where: { id }, data: { read: true } })
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
    return { updated: result.count }
  }
}
