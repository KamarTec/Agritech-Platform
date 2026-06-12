import { IsDateString, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator'

export class CreateDemandDto {
  @IsString()
  @MinLength(2, { message: 'Crop name is required' })
  @MaxLength(100)
  crop!: string

  @IsNumber()
  @Min(0.1, { message: 'Quantity must be greater than 0' })
  quantityKg!: number

  @IsNumber()
  @Min(0.01, { message: 'Max price must be greater than 0' })
  maxPricePerKg!: number

  @IsString()
  @MinLength(2, { message: 'Delivery location is required' })
  @MaxLength(200)
  deliveryLocation!: string

  @IsDateString({}, { message: 'Needed-by date is required' })
  neededBy!: string
}
