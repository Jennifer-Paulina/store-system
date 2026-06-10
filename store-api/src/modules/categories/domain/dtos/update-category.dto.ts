import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.replace(/<[^>]*>/g, '').replace(/\.\.\//g, '').trim())
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}