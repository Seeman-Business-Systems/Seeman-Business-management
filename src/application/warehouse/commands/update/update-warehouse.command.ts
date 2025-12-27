import { Command } from '@nestjs/cqrs';
import Warehouse from 'src/domain/warehouse/warehouse';
import WarehouseStatus from 'src/domain/warehouse/warehouse-status';
import WarehouseType from 'src/domain/warehouse/warehouse-type';

class UpdateWarehouseCommand extends Command<Warehouse> {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly address: string,
    public readonly city: string,
    public readonly state: string,
    public readonly phoneNumber: string,
    public readonly warehouseType: WarehouseType,
    public readonly status: WarehouseStatus,
    public readonly branchId?: number | null,
    public readonly managerId?: number | null,
    public readonly capacity?: number | null,
  ) {
    super();
  }
}

export default UpdateWarehouseCommand;
