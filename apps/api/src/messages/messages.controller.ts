import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'
import { Message } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { MessagesService, ThreadView } from './messages.service'

class CreateThreadDto {
  @IsUUID()
  participantId!: string

  @IsOptional()
  @IsIn(['listing', 'campaign', 'demand', 'farm'])
  contextType?: string

  @IsOptional()
  @IsString()
  @MaxLength(64)
  contextId?: string
}

class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get('threads')
  threads(@CurrentUser() user: JwtPayload): Promise<ThreadView[]> {
    return this.messages.listThreads(user.sub)
  }

  @Post('threads')
  createThread(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateThreadDto
  ): Promise<{ id: string }> {
    return this.messages.createOrGetThread(user.sub, dto.participantId, dto.contextType, dto.contextId)
  }

  @Get('unread-count')
  unread(@CurrentUser() user: JwtPayload): Promise<{ count: number }> {
    return this.messages.unreadCount(user.sub)
  }

  @Get('threads/:id')
  thread(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ): Promise<Message[]> {
    return this.messages.getMessages(id, user.sub)
  }

  @Post('threads/:id')
  send(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto
  ): Promise<Message> {
    return this.messages.sendMessage(id, user.sub, dto.content)
  }
}
