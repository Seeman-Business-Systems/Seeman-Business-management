export type ActivityType =
  | 'SALE_CREATED'
  | 'SALE_CANCELLED'
  | 'PAYMENT_RECORDED'
  | 'INVENTORY_ADJUSTED'
  | 'INVENTORY_TRANSFERRED'
  | 'PRODUCT_CREATED'
  | 'BRANCH_CREATED'
  | 'WAREHOUSE_CREATED'
  | 'CUSTOMER_CREATED'
  | 'STAFF_REGISTERED'
  | 'SUPPLY_CREATED'
  | 'SUPPLY_FULFILLED'
  | 'STAFF_TRANSFERRED'
  | 'EXPENSE_RECORDED'
  | 'CONTAINER_OFFLOADED';

export interface Activity {
  id: number;
  type: ActivityType;
  actorId: number;
  actorName: string | null;
  entityType: string;
  entityId: number | null;
  entityLabel: string | null;
  branchId: number | null;
  warehouseId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityListResponse {
  data: Activity[];
  total: number;
}
