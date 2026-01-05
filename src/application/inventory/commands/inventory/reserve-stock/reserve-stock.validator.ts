import { IsNumber, IsNotEmpty, Min, IsOptional, IsString, IsDateString } from 'class-validator';

class ReserveStockValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Variant ID is required' })
  variantId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Warehouse ID is required' })
  warehouseId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsNumber()
  orderId?: number | null;

  @IsOptional()
  @IsNumber()
  customerId?: number | null;

  @IsNumber()
  @IsNotEmpty({ message: 'Reserved by staff ID is required' })
  reservedBy: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export default ReserveStockValidator;