import { Command } from '@nestjs/cqrs';
import InventoryBatch from 'src/domain/inventory/inventory-batch';

class AdjustBatchCommand extends Command<InventoryBatch> {
  constructor(
    public readonly batchId: number,
    public readonly adjustmentQuantity: number,
    public readonly notes: string,
    public readonly actorId: number,
  ) {
    super();
  }
}

export default AdjustBatchCommand;