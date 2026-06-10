import { IsString, IsEmail, IsOptional, MaxLength, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
  @IsInt()
  authUserId: number;

  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  address?: string;
}