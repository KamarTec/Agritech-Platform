import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class CreateCampaignDto {
  @IsUUID()
  farmId!: string

  @IsString()
  @MinLength(2, { message: 'Crop name is required' })
  @MaxLength(100)
  crop!: string

  @IsString()
  @MinLength(20, { message: 'Description must be at least 20 characters — tell investors about the harvest' })
  @MaxLength(3000)
  description!: string

  @IsNumber()
  @Min(100, { message: 'Target amount must be at least GHS 100' })
  targetAmount!: number

  @IsNumber()
  @Min(1, { message: 'Profit share must be at least 1%' })
  @Max(90, { message: 'Profit share cannot exceed 90%' })
  profitSharePct!: number

  @IsDateString({}, { message: 'Harvest date is required' })
  harvestDate!: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[]
}
