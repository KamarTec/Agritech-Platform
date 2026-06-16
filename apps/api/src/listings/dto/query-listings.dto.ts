import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator'
import { LISTING_CATEGORIES } from '../listing-categories'

export class QueryListingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  crop?: string

  @IsOptional()
  @IsIn(LISTING_CATEGORIES)
  category?: string

  @IsOptional()
  @IsUUID()
  farmId?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12
}
