import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import TransferBatchCommand from './transfer-batch.command';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryMovementRepository from 'src/infrastructure/database/repositories/inventory/inventory-movement.repository';
import InventoryMovement from 'src/domain/inventory/inventory-movement';
import InventoryMovementType from 'src/domain/inventory/inventory-movement-type';
import Inventory from 'src/domain/inventory/inventory';

@CommandHandler(TransferBatchCommand)
class TransferBatch implements ICommandHandler<TransferBatchCommand> {
  constructor(
    private inventoryBatches: InventoryBatchRepository,
    private inventories: InventoryRepository,
    private inventoryMovements: InventoryMovementRepository,
  ) {}

  async execute(command: TransferBatchCommand): Promise<InventoryBatch> {
    const sourceBatch = await this.inventoryBatches.findById(command.batchId);

    if (!sourceBatch) {
      throw new Error(`Batch with id ${command.batchId} not found`);
    }

    if (!sourceBatch.canTransfer()) {
      throw new Error(`Batch cannot be transferred (must be ARRIVED and have available quantity)`);
    }

    if (sourceBatch.getCurrentQuantity() < command.quantity) {
      throw new Error(
        `Insufficient quantity in batch. Available: ${sourceBatch.getCurrentQuantity()}, Requested: ${command.quantity}`,
      );
    }

    if (sourceBatch.getWarehouseId() === command.destinationWarehouseId) {
      throw new Error(`Source and destination warehouses cannot be the same`);
    }

    sourceBatch.setCurrentQuantity(
      sourceBatch.getCurrentQuantity() - command.quantity,
    );
    sourceBatch.setUpdatedAt(new Date());

    const sourceInventory = await this.inventories.findById(
      sourceBatch.getInventoryId(),
    );
    if (!sourceInventory) {
      throw new Error(
        `Inventory with id ${sourceBatch.getInventoryId()} not found`,
      );
    }

    sourceInventory.setTotalQuantity(
      sourceInventory.getTotalQuantity() - command.quantity,
    );
    sourceInventory.setUpdatedAt(new Date());

    const transferMovement = new InventoryMovement(
      undefined,
      sourceBatch.getId()!,
      InventoryMovementType.TRANSFER,
      -command.quantity,
      null,
      sourceBatch.getWarehouseId(), // fromWarehouseId
      command.destinationWarehouseId, // toWarehouseId
      command.notes,
      command.actorId,
      new Date(),
    );

    let destInventory = await this.inventories.findByVariantAndWarehouse(
      sourceInventory.getVariantId(),
      command.destinationWarehouseId,
    );

    if (!destInventory) {
      destInventory = new Inventory(
        undefined,
        sourceInventory.getVariantId(),
        command.destinationWarehouseId,
        0,
        0,
        null,
        0,
        new Date(),
        new Date(),
      );
      destInventory = await this.inventories.commit(destInventory);
    }

    const newBatchNumber = `${sourceBatch.getBatchNumber()}-T${Date.now()}`;
    const destBatch = new InventoryBatch(
      undefined,
      destInventory.getId()!,
      command.destinationWarehouseId,
      newBatchNumber,
      sourceBatch.getSupplierId(),
      command.quantity,
      command.quantity,
      sourceBatch.getCostPricePerUnit(),
      sourceBatch.getStatus(),
      new Date(),
      sourceBatch.getExpiryDate(),
      command.actorId,
      new Date(),
      new Date(),
      null,
    );

    destInventory.setTotalQuantity(
      destInventory.getTotalQuantity() + command.quantity,
    );
    destInventory.setUpdatedAt(new Date());

    await this.inventories.commit(sourceInventory);
    await this.inventories.commit(destInventory);
    await this.inventoryBatches.commit(sourceBatch);
    const savedDestBatch = await this.inventoryBatches.commit(destBatch);
    await this.inventoryMovements.commit(transferMovement);

    const destMovement = new InventoryMovement(
      undefined,
      savedDestBatch.getId()!,
      InventoryMovementType.IN,
      command.quantity,
      null, // orderId
      sourceBatch.getWarehouseId(), // fromWarehouseId
      command.destinationWarehouseId, // toWarehouseId
      `Transfer from warehouse ${sourceBatch.getWarehouseId()}`,
      command.actorId,
      new Date(),
    );
    await this.inventoryMovements.commit(destMovement);

    return savedDestBatch;
  }
}

export default TransferBatch;