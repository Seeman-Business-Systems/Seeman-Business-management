import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import AssignWarehouseToStaffCommand from './assign-warehouse-to-staff.command';
import Warehouse from 'src/domain/warehouse/warehouse';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';

@CommandHandler(AssignWarehouseToStaffCommand)
class AssignWarehouseToStaff
  implements ICommandHandler<AssignWarehouseToStaffCommand>
{
  constructor(
    private warehouses: WarehouseRepository,
    private staff: StaffRepository,
  ) {}

  async execute(command: AssignWarehouseToStaffCommand): Promise<Warehouse> {
    const warehouse = await this.warehouses.findById(command.warehouseId);

    if (!warehouse) {
      throw new Error(`Warehouse with id ${command.warehouseId} not found`);
    }

    const staffMember = await this.staff.findById(command.staffId);

    if (!staffMember) {
      throw new Error(`Staff with id ${command.staffId} not found`);
    }

    // Assign the manager
    warehouse.setManagerId(command.staffId);

    // Set warehouse phone number to manager's phone number
    warehouse.setPhoneNumber(staffMember.getPhoneNumber());

    warehouse.setUpdatedAt(new Date());

    return await this.warehouses.commit(warehouse);
  }
}

export default AssignWarehouseToStaff;
