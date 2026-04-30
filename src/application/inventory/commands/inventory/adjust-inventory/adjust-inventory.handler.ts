import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import AdjustInventoryCommand from './adjust-inventory.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryAdjusted from 'src/domain/inventory/events/inventory-adjusted.event';

@CommandHandler(AdjustInventoryCommand)
class AdjustInventoryHandler implements ICommandHandler<AdjustInventoryCommand> {
  constructor(
    private readonly inventories: InventoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AdjustInventoryCommand): Promise<Inventory> {
    const inventory = await this.inventories.findByVariantAndWarehouse(
      command.variantId,
      command.warehouseId,
    );

    if (!inventory) {
      throw new NotFoundException('No inventory record found for this variant and warehouse.');
    }

    const newQuantity = inventory.getTotalQuantity() + command.adjustmentQuantity;

    if (newQuantity < 0) {
      throw new BadRequestException(
        `Adjustment would result in negative quantity. Current: ${inventory.getTotalQuantity()}, Adjustment: ${command.adjustmentQuantity}`,
      );
    }

    inventory.setTotalQuantity(newQuantity);
    inventory.setUpdatedAt(new Date());

    const saved = await this.inventories.commit(inventory);

    this.eventBus.publish(
      new InventoryAdjusted(
        saved.getId()!,
        command.warehouseId,
        command.variantId,
        command.adjustmentQuantity,
        command.actorId,
        command.notes,
      ),
    );

    return saved;
  }
}

export default AdjustInventoryHandler;
