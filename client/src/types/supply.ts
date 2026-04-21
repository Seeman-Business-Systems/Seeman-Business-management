export type SupplyStatus = 'DRAFT' | 'FULFILLED' | 'CANCELLED';

export interface SupplyItem {
  id: number;
  variantId: number;
  variantName: string | null;
  quantity: number;
}

export interface Supply {
  id: number;
  supplyNumber: string;
  saleId: number;
  saleNumber: string;
  branchId: number;
  status: SupplyStatus;
  notes: string | null;
  suppliedBy: number | null;
  items: SupplyItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplyListResponse {
  data: Supply[];
  total: number;
}
