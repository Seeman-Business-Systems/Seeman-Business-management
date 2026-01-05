import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateBatchStatusCommand from './update-batch-status.command';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';

@CommandHandler(UpdateBatchStatusCommand)
class UpdateBatchStatus implements ICommandHandler<UpdateBatchStatusCommand> {
  constructor(private inventoryBatches: InventoryBatchRepository) {}

  async execute(command: UpdateBatchStatusCommand): Promise<InventoryBatch> {
    const batch = await this.inventoryBatches.findById(command.batchId);

    if (!batch) {
      throw new Error(`Batch with id ${command.batchId} not found`);
    }

    const currentStatus = batch.getStatus();
    const newStatus = command.status;

    if (currentStatus === InventoryBatchStatus.ORDERED) {
      if (newStatus !== InventoryBatchStatus.ON_THE_WAY) {
        throw new Error(
          `Batch in ORDERED status can only transition to ON_THE_WAY`,
        );
      }
    } else if (currentStatus === InventoryBatchStatus.ON_THE_WAY) {
      if (newStatus !== InventoryBatchStatus.ARRIVED) {
        throw new Error(
          `Batch in ON_THE_WAY status can only transition to ARRIVED. Use ReceiveBatch command instead.`,
        );
      }
    } else if (currentStatus === InventoryBatchStatus.ARRIVED) {
      throw new Error(`Cannot change status of an ARRIVED batch`);
    }

    batch.setStatus(newStatus);
    batch.setUpdatedAt(new Date());

    return await this.inventoryBatches.commit(batch);
  }
}

export default UpdateBatchStatus;