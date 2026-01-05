import InventoryMovementType from 'src/domain/inventory/inventory-movement-type';

export interface InventoryMovementFilters {
  ids?: number | number[];
  inventoryBatchId?: number | number[];
  type?: InventoryMovementType | InventoryMovementType[];
  orderId?: number;
  startDate?: Date;
  endDate?: Date;
  includeInventoryBatch?: boolean;
}