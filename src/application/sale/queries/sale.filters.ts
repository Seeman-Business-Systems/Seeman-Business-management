export interface SaleFilters {
  customerId?: number;
  branchId?: number;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
  skip?: number;
  search?: string;
}
