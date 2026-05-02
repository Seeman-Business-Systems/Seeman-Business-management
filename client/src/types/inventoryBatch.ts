export interface InventoryBatchItem {
  id: number;
  batchId: number;
  variantId: number;
  variant: {
    id: number;
    sku: string;
    variantName: string;
    sellingPrice: number;
  } | null;
  warehouseId: number;
  warehouse: { id: number; name: string; city: string; state: string } | null;
  quantity: number;
}

export interface InventoryBatch {
  id: number;
  batchNumber: string;
  arrivedAt: string;
  notes: string | null;
  isOffloaded: boolean;
  offloadedAt: string | null;
  createdBy: number;
  createdAt: string;
  items?: InventoryBatchItem[];
}

export interface CreateBatchItemInput {
  variantId: number;
  warehouseId: number;
  quantity: number;
}

export interface CreateBatchRequest {
  batchNumber: string;
  arrivedAt: string;
  notes?: string;
  items?: CreateBatchItemInput[];
}

export interface AddBatchItemRequest {
  variantId: number;
  warehouseId: number;
  quantity: number;
}
