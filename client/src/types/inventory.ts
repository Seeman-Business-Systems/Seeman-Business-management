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

export interface AddStockRequest {
  variantId: number;
  warehouseId: number;
  quantity: number;
  notes?: string;
}

// Inventory record enriched with product-level info (joined client-side)
export interface EnrichedInventoryRecord extends InventoryRecord {
  brandName?: string;
  brandId?: number;
  productType?: ProductType;
}
