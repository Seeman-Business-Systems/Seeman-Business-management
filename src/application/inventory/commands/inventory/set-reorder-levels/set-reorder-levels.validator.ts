import { IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

class SetReorderLevelsValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Variant ID is required' })
  variantId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Warehouse ID is required' })
  warehouseId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Minimum quantity is required' })
  @Min(0, { message: 'Minimum quantity cannot be negative' })
  minimumQuantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Maximum quantity cannot be negative' })
  maximumQuantity?: number | null;
}

export default SetReorderLevelsValidator;