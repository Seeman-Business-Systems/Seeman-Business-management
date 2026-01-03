import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import ReserveStockCommand from './reserve-stock.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';

@CommandHandler(ReserveStockCommand)
class ReserveStock implements ICommandHandler<ReserveStockCommand> {
  constructor(private inventories: InventoryRepository) {}

  async execute(command: ReserveStockCommand): Promise<Inventory> {
    const inventory = await this.inventories.findById(command.inventoryId);

    if (!inventory) {
      throw new Error(`Inventory with id ${command.inventoryId} not found`);
    }

    const availableQuantity = inventory.getAvailableQuantity();

    if (availableQuantity < command.quantity) {
      throw new Error(
        `Insufficient available stock. Available: ${availableQuantity}, Requested: ${command.quantity}`,
      );
    }

    inventory.setReservedQuantity(
      inventory.getReservedQuantity() + command.quantity,
    );
    inventory.setUpdatedAt(new Date());

    return await this.inventories.commit(inventory);
  }
}

export default ReserveStock;