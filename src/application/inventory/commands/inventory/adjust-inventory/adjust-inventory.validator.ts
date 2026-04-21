import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

class AdjustInventoryValidator {
  @IsNumber()
  @IsNotEmpty()
  variantId: number;

  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  @IsNumber()
  @IsNotEmpty()
  adjustmentQuantity: number;

  @IsString()
  @IsNotEmpty({ message: 'Notes are required for adjustments' })
  notes: string;
}

export default AdjustInventoryValidator;
