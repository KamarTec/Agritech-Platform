import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Farm } from '@prisma/client'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtPayload } from '../auth/auth.service'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { FarmsService, FarmWithCounts } from './farms.service'
import { CreateFarmDto } from './dto/create-farm.dto'
import { UpdateFarmDto } from './dto/update-farm.dto'

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateFarmDto): Promise<Farm> {
    return this.farmsService.create(user.sub, dto)
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  findMine(@CurrentUser() user: JwtPayload): Promise<FarmWithCounts[]> {
    return this.farmsService.findMine(user.sub)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Farm> {
    return this.farmsService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateFarmDto
  ): Promise<Farm> {
    return this.farmsService.update(id, user.sub, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ): Promise<{ deleted: true }> {
    return this.farmsService.remove(id, user.sub)
  }
}
