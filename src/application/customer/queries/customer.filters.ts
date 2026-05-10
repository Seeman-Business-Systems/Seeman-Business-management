export interface CustomerFilters {
  ids?: number | number[];
  name?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  branchId?: number | string;
  hasOutstandingBalance?: boolean | string;
  take?: number;
  skip?: number;
}