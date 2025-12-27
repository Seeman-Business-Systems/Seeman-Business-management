import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import CreateWarehouseCommand from './create-warehouse.command';
import Warehouse from 'src/domain/warehouse/warehouse';
import WarehouseCreated from 'src/domain/warehouse/events/warehouse-created.event';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';

@CommandHandler(CreateWarehouseCommand)
class CreateWarehouse implements ICommandHandler<CreateWarehouseCommand> {
  constructor(
    private warehouses: WarehouseRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateWarehouseCommand): Promise<Warehouse> {
    const warehouse = new Warehouse(
      undefined,
      command.name,
      command.address,
      command.city,
      command.state,
      command.status,
      command.phoneNumber,
      command.branchId ?? null,
      command.managerId ?? null,
      command.warehouseType,
      command.capacity ?? null,
      command.createdBy,
      new Date(),
      new Date(),
    );

    const createdWarehouse = await this.warehouses.commit(warehouse);

    this.eventBus.publish(
      new WarehouseCreated(
        createdWarehouse.getId() as number,
        createdWarehouse.getName(),
        createdWarehouse.getBranchId(),
        createdWarehouse.getCreatedBy(),
        createdWarehouse.getCreatedAt(),
      ),
    );

    return createdWarehouse;
  }
}

export default CreateWarehouse;
