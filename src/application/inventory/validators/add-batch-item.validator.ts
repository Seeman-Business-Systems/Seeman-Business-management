import { IsInt, Min } from 'class-validator';

class AddBatchItemValidator {
  @IsInt()
  variantId: number;

  @IsInt()
  warehouseId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export default AddBatchItemValidator;
