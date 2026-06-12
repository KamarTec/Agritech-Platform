import { PartialType, OmitType } from '@nestjs/mapped-types'
import { IsIn, IsOptional } from 'class-validator'
import { CreateListingDto } from './create-listing.dto'

const LISTING_STATUSES = ['ACTIVE', 'SOLD', 'EXPIRED'] as const

export class UpdateListingDto extends PartialType(OmitType(CreateListingDto, ['farmId'] as const)) {
  @IsOptional()
  @IsIn(LISTING_STATUSES)
  status?: (typeof LISTING_STATUSES)[number]
}
