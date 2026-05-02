export interface ReportArgs {
  dateFrom: string;
  dateTo: string;
  branchId?: number;
}

// Sales Report
export interface SalesReportSummary {
  totalSales: number;
  totalRevenue: number;
  avgOrderValue: number;
  paidCount: number;
  partialCount: number;
  pendingCount: number;
  outstandingAmount: number;
}

export interface SalesReportByBranch {
  branchName: string;
  salesCount: number;
  revenue: number;
}

export interface SalesReportByPaymentStatus {
  status: string;
  count: number;
  amount: number;
}

export interface SalesReportRow {
  id: number;
  saleNumber: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  soldAt: string;
  branchName: string;
  soldByName: string;
  customerName: string;
}

export interface SalesReport {
  summary: SalesReportSummary;
  byBranch: SalesReportByBranch[];
  byPaymentStatus: SalesReportByPaymentStatus[];
  rows: SalesReportRow[];
}

// Expenses Report
export interface ExpensesReportSummary {
  totalExpenses: number;
  totalCount: number;
}

export interface ExpensesReportByCategory {
  category: string;
  amount: number;
  count: number;
}

export interface ExpensesReportByBranch {
  branchName: string;
  amount: number;
  count: number;
}

export interface ExpensesReportRow {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  notes: string | null;
  branchName: string;
  recordedByName: string;
}

export interface ExpensesReport {
  summary: ExpensesReportSummary;
  byCategory: ExpensesReportByCategory[];
  byBranch: ExpensesReportByBranch[];
  rows: ExpensesReportRow[];
}

// Inventory Report
export interface InventoryReportSummary {
  totalItems: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryReportRow {
  variantName: string;
  productName: string;
  warehouseName: string;
  branchName: string;
  totalQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number;
  availableQuantity: number;
  isLowStock: boolean;
}

export interface InventoryReport {
  summary: InventoryReportSummary;
  rows: InventoryReportRow[];
}

// Products Report
export interface ProductsReportSummary {
  totalRevenue: number;
  totalProductsSold: number;
  totalUnitsSold: number;
}

export interface ProductsReportRow {
  variantName: string;
  productName: string;
  totalQtySold: number;
  totalRevenue: number;
  orderCount: number;
}

export interface ProductsReport {
  summary: ProductsReportSummary;
  rows: ProductsReportRow[];
}

// Customers Report
export interface CustomersReportSummary {
  totalCustomers: number;
  totalOutstanding: number;
}

export interface CustomersReportRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  creditLimit: number;
  outstandingBalance: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface CustomersReport {
  summary: CustomersReportSummary;
  rows: CustomersReportRow[];
}

// Staff Report
export interface StaffReportRow {
  staffName: string;
  branchName: string;
  salesCount: number;
  totalRevenue: number;
  avgSaleValue: number;
}

export interface StaffReport {
  rows: StaffReportRow[];
}
