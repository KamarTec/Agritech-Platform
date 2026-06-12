import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class CreateBidDto {
  @IsNumber()
  @Min(0.01, { message: 'Offered price must be greater than 0' })
  offeredPrice!: number

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string
}
