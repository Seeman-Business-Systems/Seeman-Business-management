import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteBatchCommand from './delete-batch.command';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';

@CommandHandler(DeleteBatchCommand)
class DeleteBatch implements ICommandHandler<DeleteBatchCommand> {
  constructor(private inventoryBatches: InventoryBatchRepository) {}

  async execute(command: DeleteBatchCommand): Promise<void> {
    const batch = await this.inventoryBatches.findById(command.batchId);

    if (!batch) {
      throw new Error(`Batch with id ${command.batchId} not found`);
    }

    if (batch.getCurrentQuantity() > 0) {
      throw new Error(
        `Cannot delete batch with remaining quantity. Current quantity: ${batch.getCurrentQuantity()}`,
      );
    }

    await this.inventoryBatches.delete(command.batchId);
  }
}

export default DeleteBatch;