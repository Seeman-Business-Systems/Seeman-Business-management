import SupplyStatus from 'src/domain/supply/supply-status';

export default interface SupplyFilters {
  branchId?: number;
  saleId?: number;
  status?: SupplyStatus;
  suppliedBy?: number;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
  skip?: number;
}
