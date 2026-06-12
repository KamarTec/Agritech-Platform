import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Bid, DemandRequest } from '@prisma/client'
import { IsIn } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { DemandsService, PaginatedDemands } from './demands.service'
import { CreateDemandDto } from './dto/create-demand.dto'
import { CreateBidDto } from './dto/create-bid.dto'
import { QueryDemandsDto } from './dto/query-demands.dto'

class UpdateDemandStatusDto {
  @IsIn(['COMPLETED', 'OPEN'])
  status!: 'COMPLETED' | 'OPEN'
}

@Controller('demands')
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RETAILER')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDemandDto): Promise<DemandRequest> {
    return this.demandsService.create(user.sub, dto)
  }

  @Get()
  findOpen(@Query() query: QueryDemandsDto): Promise<PaginatedDemands> {
    return this.demandsService.findOpen(query)
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RETAILER')
  findMine(@CurrentUser() user: JwtPayload): Promise<DemandRequest[]> {
    return this.demandsService.findMine(user.sub)
  }

  @Get('bids/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  findMyBids(@CurrentUser() user: JwtPayload): Promise<Bid[]> {
    return this.demandsService.findMyBids(user.sub)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DemandRequest> {
    return this.demandsService.findOne(id)
  }

  @Get(':id/bids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RETAILER')
  findBids(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ): Promise<Bid[]> {
    return this.demandsService.findBids(id, user.sub)
  }

  @Post(':id/bids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  placeBid(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBidDto
  ): Promise<Bid> {
    return this.demandsService.placeBid(id, user.sub, dto)
  }

  @Post('bids/:bidId/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RETAILER')
  acceptBid(
    @Param('bidId', ParseUUIDPipe) bidId: string,
    @CurrentUser() user: JwtPayload
  ): Promise<Bid> {
    return this.demandsService.acceptBid(bidId, user.sub)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RETAILER')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateDemandStatusDto
  ): Promise<DemandRequest> {
    return this.demandsService.updateStatus(id, user.sub, dto.status)
  }
}
