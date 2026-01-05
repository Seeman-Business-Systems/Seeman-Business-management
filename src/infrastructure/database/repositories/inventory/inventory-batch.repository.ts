import { Injectable } from '@nestjs/common';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchEntity from '../../entities/inventory-batch.entity';
import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';

@Injectable()
abstract class InventoryBatchRepository {
  abstract findById(id: number): Promise<InventoryBatch | null>;
  abstract findByInventoryId(inventoryId: number): Promise<InventoryBatch[]>;
  abstract findByBatchNumber(batchNumber: string): Promise<InventoryBatch | null>;
  abstract findByStatus(status: InventoryBatchStatus): Promise<InventoryBatch[]>;
  abstract findByWarehouse(warehouseId: number): Promise<InventoryBatch[]>;
  abstract findExpiringBatches(days: number): Promise<InventoryBatch[]>;
  abstract findOldestBatches(
    variantId: number,
    warehouseId: number,
  ): Promise<InventoryBatch[]>;
  abstract findAll(): Promise<InventoryBatch[]>;
  abstract commit(batch: InventoryBatch): Promise<InventoryBatch>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<InventoryBatch>;
  abstract toDomain(entity: InventoryBatchEntity): InventoryBatch;
}

export default InventoryBatchRepository;