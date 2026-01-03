import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

class AdjustBatchValidator {
  @IsNumber()
  @IsNotEmpty({ message: 'Adjustment quantity is required' })
  adjustmentQuantity: number;

  @IsString()
  @IsNotEmpty({ message: 'Notes are required for adjustments' })
  notes: string;
}

export default AdjustBatchValidator;