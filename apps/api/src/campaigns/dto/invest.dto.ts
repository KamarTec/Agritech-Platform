import { IsNumber, Min } from 'class-validator'

export class InvestDto {
  @IsNumber()
  @Min(10, { message: 'Minimum investment is GHS 10' })
  amount!: number
}
