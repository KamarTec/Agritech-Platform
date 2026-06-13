import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator'

export class QueryListingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  crop?: string

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
