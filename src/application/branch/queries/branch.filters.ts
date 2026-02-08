export interface BranchFilters {
  ids?: number | number[];
  name?: string;
  search?: string;
  status?: string;
  isHeadOffice?: boolean;
  managerId?: number;
  city?: string | string[];
  state?: string | string[];
  includeStaff?: boolean;
  includeInventory?: boolean;
  skip?: number;
  take?: number;
}
