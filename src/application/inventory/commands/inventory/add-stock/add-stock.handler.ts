import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import AddStockCommand from './add-stock.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import StockAdded from 'src/domain/inventory/events/stock-added.event';

@CommandHandler(AddStockCommand)
class AddStockHandler implements ICommandHandler<AddStockCommand> {
  constructor(
    private readonly inventories: InventoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddStockCommand): Promise<Inventory> {
    let inventory = await this.inventories.findByVariantAndWarehouse(
      command.variantId,
      command.warehouseId,
    );

    if (inventory) {
      inventory.setTotalQuantity(inventory.getTotalQuantity() + command.quantity);
      inventory.setUpdatedAt(new Date());
    } else {
      inventory = new Inventory(
        undefined,
        command.variantId,
        command.warehouseId,
        command.quantity,
        0,
        null,
        new Date(),
        new Date(),
      );
    }

    const saved = await this.inventories.commit(inventory);

    this.eventBus.publish(
      new StockAdded(
        saved.getId()!,
        command.variantId,
        command.warehouseId,
        command.quantity,
        command.actorId,
        command.notes,
      ),
    );

    return saved;
  }
}

export default AddStockHandler;
