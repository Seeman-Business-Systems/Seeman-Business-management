import { Command } from '@nestjs/cqrs';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';

class UpdateBatchStatusCommand extends Command<InventoryBatch> {
  constructor(
    public readonly batchId: number,
    public readonly status: InventoryBatchStatus,
  ) {
    super();
  }
}

export default UpdateBatchStatusCommand;