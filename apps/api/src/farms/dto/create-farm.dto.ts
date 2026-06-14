import { IsArray, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateFarmDto {
  @IsString()
  @MinLength(2, { message: 'Farm name must be at least 2 characters' })
  @MaxLength(100)
  name!: string

  @IsString()
  @MinLength(2, { message: 'Location is required' })
  @MaxLength(200)
  location!: string

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[]
}
