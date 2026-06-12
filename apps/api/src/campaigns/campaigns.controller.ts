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
import { Campaign, Investment } from '@prisma/client'
import { IsIn } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { CampaignsService, PaginatedCampaigns } from './campaigns.service'
import { CreateCampaignDto } from './dto/create-campaign.dto'
import { InvestDto } from './dto/invest.dto'
import { QueryCampaignsDto } from './dto/query-campaigns.dto'

class UpdateCampaignStatusDto {
  @IsIn(['HARVESTED', 'SETTLED'])
  status!: 'HARVESTED' | 'SETTLED'
}

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCampaignDto): Promise<Campaign> {
    return this.campaignsService.create(user.sub, dto)
  }

  @Get()
  findBrowsable(@Query() query: QueryCampaignsDto): Promise<PaginatedCampaigns> {
    return this.campaignsService.findBrowsable(query)
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  findMine(@CurrentUser() user: JwtPayload): Promise<Campaign[]> {
    return this.campaignsService.findMine(user.sub)
  }

  @Get('portfolio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INVESTOR')
  findPortfolio(@CurrentUser() user: JwtPayload): Promise<Investment[]> {
    return this.campaignsService.findPortfolio(user.sub)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Campaign> {
    return this.campaignsService.findOne(id)
  }

  @Post(':id/invest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INVESTOR')
  invest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: InvestDto
  ): Promise<Investment> {
    return this.campaignsService.invest(id, user.sub, dto)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCampaignStatusDto
  ): Promise<Campaign> {
    return this.campaignsService.updateStatus(id, user.sub, dto.status)
  }
}
