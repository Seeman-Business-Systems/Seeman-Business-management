import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import ReceiveBatchCommand from './receive-batch.command';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryMovementRepository from 'src/infrastructure/database/repositories/inventory/inventory-movement.repository';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';
import InventoryMovement from 'src/domain/inventory/inventory-movement';
import InventoryMovementType from 'src/domain/inventory/inventory-movement-type';
import {
  BatchNotFoundException,
  BatchCannotBeReceivedException,
  InventoryNotFoundException,
} from 'src/domain/inventory/exceptions';

@CommandHandler(ReceiveBatchCommand)
class ReceiveBatch implements ICommandHandler<ReceiveBatchCommand> {
  constructor(
    private inventoryBatches: InventoryBatchRepository,
    private inventories: InventoryRepository,
    private inventoryMovements: InventoryMovementRepository,
  ) {}

  async execute(command: ReceiveBatchCommand): Promise<InventoryBatch> {
    const batch = await this.inventoryBatches.findById(command.batchId);

    if (!batch) {
      throw new BatchNotFoundException(command.batchId);
    }

    if (
      batch.getStatus() !== InventoryBatchStatus.ORDERED &&
      batch.getStatus() !== InventoryBatchStatus.ON_THE_WAY
    ) {
      throw new BatchCannotBeReceivedException(
        `Batch must be in ORDERED or ON_THE_WAY status to be received (current status: ${batch.getStatus()})`,
      );
    }

    batch.setStatus(InventoryBatchStatus.ARRIVED);
    batch.setReceivedDate(new Date());
    batch.setUpdatedAt(new Date());

    const inventory = await this.inventories.findById(batch.getInventoryId());
    if (!inventory) {
      throw new InventoryNotFoundException(batch.getInventoryId(), batch.getWarehouseId());
    }

    inventory.setTotalQuantity(
      inventory.getTotalQuantity() + batch.getQuantityReceived(),
    );
    inventory.setUpdatedAt(new Date());

    const movement = new InventoryMovement(
      undefined,
      batch.getId()!,
      InventoryMovementType.IN,
      batch.getQuantityReceived(),
      null, // orderId
      null, // fromWarehouseId (no transfer)
      batch.getWarehouseId(), // toWarehouseId (received at this warehouse)
      `Batch received at warehouse`,
      command.actorId,
      new Date(),
    );

    await this.inventories.commit(inventory);
    await this.inventoryMovements.commit(movement);

    return await this.inventoryBatches.commit(batch);
  }
}

export default ReceiveBatch;