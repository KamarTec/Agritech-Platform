import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Message } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

export interface ThreadView {
  id: string
  contextType: string | null
  contextId: string | null
  updatedAt: Date
  otherUser: { id: string; fullName: string | null; role: string } | null
  lastMessage: { content: string; senderId: string; createdAt: Date } | null
  unreadCount: number
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  async listThreads(userId: string): Promise<ThreadView[]> {
    const threads = await this.prisma.messageThread.findMany({
      where: { participantIds: { has: userId } },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })

    const otherIds = threads
      .map((t) => t.participantIds.find((id) => id !== userId))
      .filter((id): id is string => Boolean(id))
    const people = await this.peopleMap(otherIds)

    const views = await Promise.all(
      threads.map(async (thread) => {
        const otherId = thread.participantIds.find((id) => id !== userId) ?? null
        const last = thread.messages[0] ?? null
        const unreadCount = await this.prisma.message.count({
          where: { threadId: thread.id, senderId: { not: userId }, read: false },
        })
        return {
          id: thread.id,
          contextType: thread.contextType,
          contextId: thread.contextId,
          updatedAt: thread.updatedAt,
          otherUser: otherId ? (people.get(otherId) ?? null) : null,
          lastMessage: last
            ? { content: last.content, senderId: last.senderId, createdAt: last.createdAt }
            : null,
          unreadCount,
        }
      })
    )
    return views
  }

  /** Find the existing 1:1 thread for a participant pair, or create it. */
  async createOrGetThread(
    userId: string,
    participantId: string,
    contextType?: string,
    contextId?: string
  ): Promise<{ id: string }> {
    if (participantId === userId) {
      throw new BadRequestException('You cannot message yourself')
    }
    const other = await this.prisma.profile.findUnique({ where: { id: participantId } })
    if (!other) {
      throw new NotFoundException('Recipient not found')
    }

    const candidates = await this.prisma.messageThread.findMany({
      where: { participantIds: { hasEvery: [userId, participantId] } },
    })
    const existing = candidates.find((t) => t.participantIds.length === 2)
    if (existing) {
      return { id: existing.id }
    }

    const thread = await this.prisma.messageThread.create({
      data: {
        participantIds: [userId, participantId],
        contextType: contextType ?? null,
        contextId: contextId ?? null,
      },
    })
    return { id: thread.id }
  }

  async getMessages(threadId: string, userId: string): Promise<Message[]> {
    await this.assertParticipant(threadId, userId)
    const messages = await this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    })
    await this.prisma.message.updateMany({
      where: { threadId, senderId: { not: userId }, read: false },
      data: { read: true },
    })
    return messages
  }

  async sendMessage(threadId: string, userId: string, content: string): Promise<Message> {
    const thread = await this.assertParticipant(threadId, userId)

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { threadId, senderId: userId, content: content.trim() },
      }),
      this.prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
    ])

    const recipientId = thread.participantIds.find((id) => id !== userId)
    if (recipientId) {
      const sender = await this.prisma.profile.findUnique({
        where: { id: userId },
        select: { fullName: true },
      })
      await this.notifications.notifyQuietly({
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: `New message from ${sender?.fullName ?? 'a FarmLink user'}`,
        body: content.trim().slice(0, 80),
        actionUrl: `/dashboard/messages?t=${threadId}`,
      })
    }

    return message
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.message.count({
      where: {
        read: false,
        senderId: { not: userId },
        thread: { participantIds: { has: userId } },
      },
    })
    return { count }
  }

  private async assertParticipant(
    threadId: string,
    userId: string
  ): Promise<{ id: string; participantIds: string[] }> {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
      select: { id: true, participantIds: true },
    })
    if (!thread) {
      throw new NotFoundException('Conversation not found')
    }
    if (!thread.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not part of this conversation')
    }
    return thread
  }

  private async peopleMap(
    ids: string[]
  ): Promise<Map<string, { id: string; fullName: string | null; role: string }>> {
    const unique = [...new Set(ids)]
    const people = await this.prisma.profile.findMany({
      where: { id: { in: unique } },
      select: { id: true, fullName: true, role: true },
    })
    return new Map(people.map((p) => [p.id, p]))
  }
}
