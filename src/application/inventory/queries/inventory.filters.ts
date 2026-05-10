export interface InventoryFilters {
  ids?: number | number[];
  variantId?: number | number[];
  warehouseId?: number | number[];
  // branchId?: number; this should be left out for now as users should be  able to check inventory across business
  lowInventory?: boolean;
  includeVariant?: boolean;
  includeWarehouse?: boolean;
  includeBatches?: boolean;
}
