import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import SupplyRepository from 'src/infrastructure/database/repositories/supply/supply.repository';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import SupplyStatus from 'src/domain/supply/supply-status';
import SupplyFulfilled from 'src/domain/supply/events/supply-fulfilled.event';
import FulfilSupplyCommand from './fulfil-supply.command';
import Supply from 'src/domain/supply/supply';

@CommandHandler(FulfilSupplyCommand)
class FulfilSupplyHandler implements ICommandHandler<FulfilSupplyCommand> {
  constructor(
    private readonly supplies: SupplyRepository,
    private readonly inventories: InventoryRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: FulfilSupplyCommand): Promise<Supply> {
    const supply = await this.supplies.findById(command.supplyId);

    if (!supply) {
      throw new NotFoundException(`Supply #${command.supplyId} not found`);
    }

    if (!supply.isDraft()) {
      throw new BadRequestException('Only DRAFT supplies can be fulfilled');
    }

    const items = supply.getItems();

    // Validate all items have a warehouse assigned
    const missingWarehouse = items.filter((item) => !item.getWarehouseId());
    if (missingWarehouse.length > 0) {
      const names = missingWarehouse.map((i) => i.getVariantName() ?? `Variant #${i.getVariantId()}`).join(', ');
      throw new BadRequestException(
        `Please assign a warehouse to all items before fulfilling. Missing: ${names}`,
      );
    }

    // Deduct inventory for each item
    for (const item of items) {
      const inventory = await this.inventories.findByVariantAndWarehouse(
        item.getVariantId(),
        item.getWarehouseId()!,
      );

      if (!inventory) {
        throw new BadRequestException(
          `No inventory record found for "${item.getVariantName() ?? `Variant #${item.getVariantId()}`}" at the selected warehouse.`,
        );
      }

      if (inventory.getTotalQuantity() < item.getQuantity()) {
        throw new BadRequestException(
          `Insufficient stock for "${item.getVariantName() ?? `Variant #${item.getVariantId()}`}". Available: ${inventory.getTotalQuantity()}, Required: ${item.getQuantity()}.`,
        );
      }

      inventory.setTotalQuantity(inventory.getTotalQuantity() - item.getQuantity());
      inventory.setUpdatedAt(new Date());
      await this.inventories.commit(inventory);
    }

    supply.setStatus(SupplyStatus.FULFILLED);
    supply.setSuppliedBy(command.fulfilledBy);
    if (command.notes !== null) {
      supply.setNotes(command.notes);
    }

    const saved = await this.supplies.commit(supply);

    this.eventBus.publish(
      new SupplyFulfilled(
        supply.getId()!,
        supply.getSupplyNumber(),
        supply.getSaleId(),
        supply.getBranchId(),
        command.fulfilledBy,
      ),
    );

    return saved;
  }
}

export default FulfilSupplyHandler;
