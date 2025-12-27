import { Command } from '@nestjs/cqrs';
import Warehouse from 'src/domain/warehouse/warehouse';

class AssignWarehouseToStaffCommand extends Command<Warehouse> {
  constructor(
    public readonly warehouseId: number,
    public readonly staffId: number,
  ) {
    super();
  }
}

export default AssignWarehouseToStaffCommand;
