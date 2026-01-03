import { IsEnum, IsNotEmpty } from 'class-validator';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';

class UpdateBatchStatusValidator {
  @IsEnum(InventoryBatchStatus, { message: 'Invalid batch status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: InventoryBatchStatus;
}

export default UpdateBatchStatusValidator;