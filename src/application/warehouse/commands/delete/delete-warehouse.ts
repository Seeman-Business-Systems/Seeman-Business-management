import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteWarehouseCommand from './delete-warehouse.command';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';

@CommandHandler(DeleteWarehouseCommand)
class DeleteWarehouse implements ICommandHandler<DeleteWarehouseCommand> {
  constructor(private warehouses: WarehouseRepository) {}

  async execute(command: DeleteWarehouseCommand): Promise<void> {
    const warehouse = await this.warehouses.findById(command.id);

    if (!warehouse) {
      throw new Error(`Warehouse with id ${command.id} not found`);
    }

    await this.warehouses.delete(command.id);
  }
}

export default DeleteWarehouse;
