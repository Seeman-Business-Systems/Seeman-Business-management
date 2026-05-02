import { IsString, IsInt, IsOptional, IsDateString, MinLength, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateBatchItemValidator {
  @IsInt()
  variantId: number;

  @IsInt()
  warehouseId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

class CreateBatchValidator {
  @IsString()
  @MinLength(1)
  batchNumber: string;

  @IsDateString()
  arrivedAt: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBatchItemValidator)
  items?: CreateBatchItemValidator[];
}

export default CreateBatchValidator;
export { CreateBatchItemValidator };
