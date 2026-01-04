import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import AdjustBatchCommand from './adjust-batch.command';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryMovementRepository from 'src/infrastructure/database/repositories/inventory/inventory-movement.repository';
import InventoryMovement from 'src/domain/inventory/inventory-movement';
import InventoryMovementType from 'src/domain/inventory/inventory-movement-type';

@CommandHandler(AdjustBatchCommand)
class AdjustBatch implements ICommandHandler<AdjustBatchCommand> {
  constructor(
    private inventoryBatches: InventoryBatchRepository,
    private inventories: InventoryRepository,
    private inventoryMovements: InventoryMovementRepository,
  ) {}

  async execute(command: AdjustBatchCommand): Promise<InventoryBatch> {
    const batch = await this.inventoryBatches.findById(command.batchId);

    if (!batch) {
      throw new Error(`Batch with id ${command.batchId} not found`);
    }

    const newQuantity = batch.getCurrentQuantity() + command.adjustmentQuantity;

    if (newQuantity < 0) {
      throw new Error(
        `Adjustment would result in negative quantity. Current: ${batch.getCurrentQuantity()}, Adjustment: ${command.adjustmentQuantity}`,
      );
    }

    batch.setCurrentQuantity(newQuantity);
    batch.setUpdatedAt(new Date());

    const inventory = await this.inventories.findById(batch.getInventoryId());
    if (!inventory) {
      throw new Error(`Inventory with id ${batch.getInventoryId()} not found`);
    }

    inventory.setTotalQuantity(
      inventory.getTotalQuantity() + command.adjustmentQuantity,
    );
    inventory.setUpdatedAt(new Date());

    const movement = new InventoryMovement(
      undefined,
      batch.getId()!,
      InventoryMovementType.ADJUST,
      command.adjustmentQuantity,
      null, // orderId
      null, // fromWarehouseId (no transfer)
      batch.getWarehouseId(), // toWarehouseId (adjustment at this warehouse)
      command.notes,
      command.actorId,
      new Date(),
    );

    await this.inventories.commit(inventory);
    await this.inventoryMovements.commit(movement);

    return await this.inventoryBatches.commit(batch);
  }
}

export default AdjustBatch;