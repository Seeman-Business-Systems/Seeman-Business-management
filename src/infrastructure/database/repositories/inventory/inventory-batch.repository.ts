import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchItem from 'src/domain/inventory/inventory-batch-item';

abstract class InventoryBatchRepository {
  abstract findById(id: number): Promise<InventoryBatch | null>;
  abstract findAll(offloaded?: boolean): Promise<InventoryBatch[]>;
  abstract commit(batch: InventoryBatch): Promise<InventoryBatch>;
  abstract addItem(item: InventoryBatchItem): Promise<InventoryBatchItem>;
  abstract removeItem(itemId: number): Promise<void>;
  abstract findItems(batchId: number): Promise<InventoryBatchItem[]>;
  abstract findItem(itemId: number): Promise<InventoryBatchItem | null>;
}

export default InventoryBatchRepository;
