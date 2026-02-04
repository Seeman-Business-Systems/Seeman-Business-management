export interface StaffFilters {
  ids?: number | number[];
  search?: string;
  roleId?: number | number[];
  branchId?: number | number[];
  skip?: number;
  take?: number;
}
