export type ChartGranularity = 'daily' | 'weekly' | 'monthly';

export interface ChartPoint {
  period: string;
  revenue: number;
  expenses: number;
}

export interface TopProductRow {
  variantName: string;
  productName: string;
  totalQty: number;
  totalRevenue: number;
}

export interface DashboardRecentSale {
  id: number;
  saleNumber: string;
  totalAmount: number;
  paymentStatus: string;
  soldAt: string;
  branchName: string;
  soldByName: string;
}

export interface DashboardSummary {
  revenue: number;
  expenses: number;
  salesCount: number;
  pendingPayments: number;
  lowStockCount: number;
  pendingSupplies: number;
  granularity: ChartGranularity;
  chartData: ChartPoint[];
  topProducts: TopProductRow[];
  recentSales: DashboardRecentSale[];
}

export interface DashboardSummaryArgs {
  branchId?: number;
  dateFrom: string;
  dateTo: string;
}
