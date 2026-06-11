import { IsEmail, IsIn, IsString, MinLength } from 'class-validator'

export const REGISTERABLE_ROLES = ['FARMER', 'RETAILER', 'INVESTOR', 'SUPPLIER'] as const
export type RegisterableRole = (typeof REGISTERABLE_ROLES)[number]

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullName!: string

  @IsIn(REGISTERABLE_ROLES, { message: 'Role must be FARMER, RETAILER, INVESTOR, or SUPPLIER' })
  role!: RegisterableRole
}
