import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Listing } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { ListingsService, PaginatedMarketplace } from './listings.service'
import { CreateListingDto } from './dto/create-listing.dto'
import { UpdateListingDto } from './dto/update-listing.dto'
import { QueryListingsDto } from './dto/query-listings.dto'

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateListingDto): Promise<Listing> {
    return this.listingsService.create(user.sub, dto)
  }

  @Get()
  findMarketplace(@Query() query: QueryListingsDto): Promise<PaginatedMarketplace> {
    return this.listingsService.findMarketplace(query)
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  findMine(@CurrentUser() user: JwtPayload): Promise<Listing[]> {
    return this.listingsService.findMine(user.sub)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Listing> {
    return this.listingsService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateListingDto
  ): Promise<Listing> {
    return this.listingsService.update(id, user.sub, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ): Promise<{ deleted: true }> {
    return this.listingsService.remove(id, user.sub)
  }
}
