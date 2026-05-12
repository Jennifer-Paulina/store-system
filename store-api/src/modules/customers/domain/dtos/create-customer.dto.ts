import { IsString, IsEmail, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateCustomerDto {
  @IsInt()
  authUserId: number;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}