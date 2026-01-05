import { Command } from '@nestjs/cqrs';
import InventoryBatch from 'src/domain/inventory/inventory-batch';

class ReceiveBatchCommand extends Command<InventoryBatch> {
  constructor(
    public readonly batchId: number,
    public readonly actorId: number,
  ) {
    super();
  }
}

export default ReceiveBatchCommand;