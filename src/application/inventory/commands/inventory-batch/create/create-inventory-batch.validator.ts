import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Length,
} from 'class-validator';

class CreateInventoryBatchValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Variant ID is required' })
  variantId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Warehouse ID is required' })
  warehouseId: number;

  @IsString()
  @IsNotEmpty({ message: 'Batch number is required' })
  @Length(2, 100, {
    message: 'Batch number must be between 2 and 100 characters',
  })
  batchNumber: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Supplier ID is required' })
  supplierId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Quantity received is required' })
  @Min(1, { message: 'Quantity received must be at least 1' })
  quantityReceived: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Cost price per unit is required' })
  @Min(0, { message: 'Cost price per unit must be at least 0' })
  costPricePerUnit: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;
}

export default CreateInventoryBatchValidator;