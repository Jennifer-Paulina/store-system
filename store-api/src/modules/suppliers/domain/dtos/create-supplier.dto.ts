import { IsString, IsOptional, MaxLength, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSupplierDto {
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  contact?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  description?: string;
}