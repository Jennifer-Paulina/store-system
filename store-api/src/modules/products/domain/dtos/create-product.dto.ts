import { IsString, IsOptional, MaxLength, IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
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