import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CreateBatchCommand from './create-batch.command';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchItem from 'src/domain/inventory/inventory-batch-item';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';

@CommandHandler(CreateBatchCommand)
class CreateBatchHandler implements ICommandHandler<CreateBatchCommand> {
  constructor(private readonly batchRepo: InventoryBatchRepository) {}

  async execute(command: CreateBatchCommand): Promise<InventoryBatch> {
    const batch = new InventoryBatch(
      undefined,
      command.batchNumber,
      command.arrivedAt,
      command.notes,
      null,
      command.actorId,
      new Date(),
    );
    const saved = await this.batchRepo.commit(batch);

    for (const it of command.items) {
      const item = new InventoryBatchItem(undefined, saved.getId()!, it.variantId, it.warehouseId, it.quantity);
      await this.batchRepo.addItem(item);
    }

    return (await this.batchRepo.findById(saved.getId()!))!;
  }
}

export default CreateBatchHandler;
