import Staff from 'src/domain/staff/staff';

export interface BranchFilters {
  ids?: number | number[];
  name?: string;
  status?: string;
  isHeadOffice?: boolean;
  managerId?: number;
  city?: string | string[];
  state?: string | string[];
  includeStaff?: boolean;
  includeInventory?: boolean;
}
