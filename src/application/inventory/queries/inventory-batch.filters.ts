import InventoryBatchStatus from 'src/domain/inventory/inventory-batch-status';

export interface InventoryBatchFilters {
  ids?: number | number[];
  inventoryId?: number | number[];
  warehouseId?: number | number[];
  variantId?: number | number[];
  batchNumber?: string;
  status?: InventoryBatchStatus | InventoryBatchStatus[];
  supplierId?: number | number[];
  expiringInDays?: number;
  includeInventory?: boolean;
  includeWarehouse?: boolean;
  includeMovements?: boolean;
}