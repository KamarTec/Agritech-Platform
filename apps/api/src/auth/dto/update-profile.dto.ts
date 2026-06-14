import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name must be at most 100 characters' })
  fullName?: string

  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'Phone must be at most 30 characters' })
  phone?: string

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Location must be at most 120 characters' })
  location?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string
}
