import { IsNumber, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

class TransferBatchValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Destination warehouse ID is required' })
  destinationWarehouseId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export default TransferBatchValidator;