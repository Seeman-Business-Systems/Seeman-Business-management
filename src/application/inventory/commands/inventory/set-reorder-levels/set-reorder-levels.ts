import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import SetReorderLevelsCommand from './set-reorder-levels.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';

@CommandHandler(SetReorderLevelsCommand)
class SetReorderLevels implements ICommandHandler<SetReorderLevelsCommand> {
  constructor(private inventories: InventoryRepository) {}

  async execute(command: SetReorderLevelsCommand): Promise<Inventory> {
    const inventory = await this.inventories.findById(command.inventoryId);

    if (!inventory) {
      throw new Error(`Inventory with id ${command.inventoryId} not found`);
    }

    if (
      command.maximumQuantity !== null &&
      command.maximumQuantity < command.minimumQuantity
    ) {
      throw new Error(
        `Maximum quantity cannot be less than minimum quantity`,
      );
    }

    inventory.setMinimumQuantity(command.minimumQuantity);
    inventory.setMaximumQuantity(command.maximumQuantity);
    inventory.setUpdatedAt(new Date());

    return await this.inventories.commit(inventory);
  }
}

export default SetReorderLevels;