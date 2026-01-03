export interface InventoryFilters {
  ids?: number | number[];
  variantId?: number | number[];
  warehouseId?: number | number[];
  lowStock?: boolean;
  includeVariant?: boolean;
  includeWarehouse?: boolean;
  includeBatches?: boolean;
}