import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import AdjustInventoryCommand from './adjust-inventory.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryAdjusted from 'src/domain/inventory/events/inventory-adjusted.event';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';

@CommandHandler(AdjustInventoryCommand)
class AdjustInventoryHandler implements ICommandHandler<AdjustInventoryCommand> {
  constructor(
    private readonly inventories: InventoryRepository,
    private readonly variants: ProductVariantRepository,
    private readonly warehouses: WarehouseRepository,
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

    const variant = await this.variants.findById(command.variantId);
    const variantName = variant?.getVariantName() ?? null;

    const warehouse = await this.warehouses.findById(command.warehouseId);
    const warehouseName = warehouse?.getName() ?? null;

    this.eventBus.publish(
      new InventoryAdjusted(
        saved.getId()!,
        command.warehouseId,
        warehouseName,
        command.variantId,
        variantName,
        command.adjustmentQuantity,
        command.actorId,
        command.notes,
      ),
    );

    return saved;
  }
}

export default AdjustInventoryHandler;
