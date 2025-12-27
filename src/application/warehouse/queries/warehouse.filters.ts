import WarehouseStatus from 'src/domain/warehouse/warehouse-status';
import WarehouseType from 'src/domain/warehouse/warehouse-type';

export interface WarehouseFilters {
  ids?: number | number[];
  name?: string;
  status?: WarehouseStatus;
  city?: string | string[];
  state?: string | string[];
  branchId?: number | number[];
  managerId?: number;
  warehouseType?: WarehouseType | WarehouseType[];
  includeBranch?: boolean;
  includeManager?: boolean;
}
