import { IsString, MaxLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  value: string;
}