import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Transaction } from '@prisma/client'
import { IsNumber, IsUUID, Min } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { InitializeOrderResult, TransactionsService } from './transactions.service'

class InitializeOrderDto {
  @IsUUID()
  listingId!: string

  @IsNumber()
  @Min(0.1, { message: 'Quantity must be greater than 0' })
  quantityKg!: number
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('initialize')
  initialize(
    @CurrentUser() user: JwtPayload,
    @Body() dto: InitializeOrderDto
  ): Promise<InitializeOrderResult> {
    return this.transactionsService.initializeOrder(
      user.sub,
      user.email,
      dto.listingId,
      dto.quantityKg
    )
  }

  @Get('mine')
  findMine(@CurrentUser() user: JwtPayload): Promise<Transaction[]> {
    return this.transactionsService.findMine(user.sub)
  }

  @Post('verify/:reference')
  verify(@Param('reference') reference: string): Promise<Transaction> {
    return this.transactionsService.verifyPayment(reference)
  }

  @Post(':id/confirm-delivery')
  confirmDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ): Promise<Transaction> {
    return this.transactionsService.confirmDelivery(id, user.sub)
  }

  @Post(':id/dispute')
  dispute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ): Promise<Transaction> {
    return this.transactionsService.dispute(id, user.sub)
  }
}
