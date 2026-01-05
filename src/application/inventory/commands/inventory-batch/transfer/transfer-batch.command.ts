import { Command } from '@nestjs/cqrs';
import InventoryBatch from 'src/domain/inventory/inventory-batch';

class TransferBatchCommand extends Command<InventoryBatch> {
  constructor(
    public readonly batchId: number,
    public readonly destinationWarehouseId: number,
    public readonly quantity: number,
    public readonly actorId: number,
    public readonly notes: string | null,
  ) {
    super();
  }
}

export default TransferBatchCommand;