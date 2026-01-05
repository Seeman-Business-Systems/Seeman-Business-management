import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import CreateInventoryBatchCommand from './create-inventory-batch.command';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';
import Inventory from 'src/domain/inventory/inventory';

@CommandHandler(CreateInventoryBatchCommand)
class CreateInventoryBatch
  implements ICommandHandler<CreateInventoryBatchCommand>
{
  constructor(
    private inventoryBatches: InventoryBatchRepository,
    private inventories: InventoryRepository,
  ) {}

  async execute(command: CreateInventoryBatchCommand): Promise<InventoryBatch> {
    let inventory = await this.inventories.findByVariantAndWarehouse(
      command.variantId,
      command.warehouseId,
    );

    if (!inventory) {
      inventory = new Inventory(
        undefined,
        command.variantId,
        command.warehouseId,
        0,
        0,
        null,
        0,
        new Date(),
        new Date(),
      );
      inventory = await this.inventories.commit(inventory);
    }

    const batch = new InventoryBatch(
      undefined,
      inventory.getId()!,
      command.warehouseId,
      command.batchNumber,
      command.supplierId,
      command.quantityReceived,
      command.quantityReceived,
      command.costPricePerUnit,
      InventoryBatchStatus.ORDERED,
      null,
      command.expiryDate,
      command.createdBy,
      new Date(),
      new Date(),
      null,
    );

    return await this.inventoryBatches.commit(batch);
  }
}

export default CreateInventoryBatch;