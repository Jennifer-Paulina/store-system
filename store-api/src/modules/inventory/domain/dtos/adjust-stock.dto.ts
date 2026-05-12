import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';
import { MovementType } from '../entities/inventory.entity';

export class AdjustStockDto {
  @IsInt()
  quantity: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsOptional()
  @IsString()
  reference?: string;
}