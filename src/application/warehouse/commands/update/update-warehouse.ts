import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateWarehouseCommand from './update-warehouse.command';
import Warehouse from 'src/domain/warehouse/warehouse';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';

@CommandHandler(UpdateWarehouseCommand)
class UpdateWarehouse implements ICommandHandler<UpdateWarehouseCommand> {
  constructor(private warehouses: WarehouseRepository) {}

  async execute(command: UpdateWarehouseCommand): Promise<Warehouse> {
    const warehouseToUpdate = await this.warehouses.findById(command.id);

    if (!warehouseToUpdate) {
      throw new Error(`Warehouse with id ${command.id} not found`);
    }

    warehouseToUpdate.setName(command.name);
    warehouseToUpdate.setAddress(command.address);
    warehouseToUpdate.setCity(command.city);
    warehouseToUpdate.setState(command.state);
    warehouseToUpdate.setStatus(command.status);
    warehouseToUpdate.setPhoneNumber(command.phoneNumber);
    warehouseToUpdate.setWarehouseType(command.warehouseType);

    if (command.branchId !== undefined) {
      warehouseToUpdate.setBranchId(command.branchId);
    }

    if (command.managerId !== undefined) {
      warehouseToUpdate.setManagerId(command.managerId);
    }

    if (command.capacity !== undefined) {
      warehouseToUpdate.setCapacity(command.capacity);
    }

    warehouseToUpdate.setUpdatedAt(new Date());

    return await this.warehouses.commit(warehouseToUpdate);
  }
}

export default UpdateWarehouse;
