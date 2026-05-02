import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import SetReorderLevelsCommand from './set-reorder-levels.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import { InvalidReorderLevelsException } from 'src/domain/inventory/exceptions';

@CommandHandler(SetReorderLevelsCommand)
class SetReorderLevels implements ICommandHandler<SetReorderLevelsCommand> {
  constructor(private inventories: InventoryRepository) {}

  async execute(command: SetReorderLevelsCommand): Promise<Inventory> {
    let inventory = await this.inventories.findByVariantAndWarehouse(
      command.variantId,
      command.warehouseId,
    );

    if (!inventory) {
      // Create new inventory record if it doesn't exist
      inventory = new Inventory(
        undefined,
        command.variantId,
        command.warehouseId,
        0, // totalQuantity
        command.minimumQuantity,
        command.maximumQuantity,
        new Date(),
        new Date(),
      );
    } else {
      if (
        command.maximumQuantity !== null &&
        command.maximumQuantity < command.minimumQuantity
      ) {
        throw new InvalidReorderLevelsException(
          `Maximum quantity (${command.maximumQuantity}) cannot be less than minimum quantity (${command.minimumQuantity})`,
        );
      }

      inventory.setMinimumQuantity(command.minimumQuantity);
      inventory.setMaximumQuantity(command.maximumQuantity);
      inventory.setUpdatedAt(new Date());
    }

    return await this.inventories.commit(inventory);
  }
}

export default SetReorderLevels;