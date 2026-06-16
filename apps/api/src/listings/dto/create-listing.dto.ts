import { IsArray, IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator'
import { LISTING_CATEGORIES } from '../listing-categories'

export class CreateListingDto {
  @IsUUID()
  farmId!: string

  @IsString()
  @MinLength(2, { message: 'Crop name is required' })
  @MaxLength(100)
  crop!: string

  @IsOptional()
  @IsIn(LISTING_CATEGORIES, { message: 'Invalid produce category' })
  category?: string

  @IsNumber()
  @Min(0.1, { message: 'Quantity must be greater than 0' })
  quantityKg!: number

  @IsNumber()
  @Min(0.01, { message: 'Price must be greater than 0' })
  pricePerKg!: number

  @IsOptional()
  @IsDateString()
  harvestDate?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[]
}
