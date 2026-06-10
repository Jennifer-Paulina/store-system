import { IsString, IsOptional, MaxLength, IsNumber, IsPositive, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsInt()
  supplierId?: number;
}