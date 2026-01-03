import { IsNumber, IsNotEmpty, Min } from 'class-validator';

class ReserveStockValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export default ReserveStockValidator;