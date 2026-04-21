import type { ProductVariant, ProductType } from './product';

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  status: string;
  phoneNumber: string;
  warehouseType: number;
  capacity: number | null;
  branchId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryRecord {
  id: number;
  variantId: number;
  warehouseId: number;
  variant: ProductVariant | null;
  warehouse: Warehouse | null;
  totalQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number | null;
  reservedQuantity: number;
  availableQuantity: number;
  isLowInventory: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  variantId?: number;
  warehouseId?: number;
  lowInventory?: boolean;
}

export interface SetReorderLevelsRequest {
  variantId: number;
  warehouseId: number;
  minimumQuantity: number;
  maximumQuantity?: number | null;
}

export interface AdjustInventoryRequest {
  variantId: number;
  warehouseId: number;
  adjustmentQuantity: number;
  notes: string;
}

// Inventory record enriched with product-level info (joined client-side)
export interface EnrichedInventoryRecord extends InventoryRecord {
  brandName?: string;
  brandId?: number;
  productType?: ProductType;
}

export interface CreateInventoryBatchRequest {
  variantId: number;
  warehouseId: number;
  batchNumber: string;
  supplierId: number;
  quantityReceived: number;
  costPricePerUnit: number;
  expiryDate?: string | null;
}

export interface InventoryBatch {
  id: number;
  inventoryId: number;
  warehouseId: number;
  batchNumber: string;
  supplierId: number;
  quantityReceived: number;
  currentQuantity: number;
  costPricePerUnit: number;
  status: number;
  receivedDate: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}
