import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import AdjustInventoryHandler from './adjust-inventory.handler';
import AdjustInventoryCommand from './adjust-inventory.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryAdjusted from 'src/domain/inventory/events/inventory-adjusted.event';

describe('AdjustInventoryHandler', () => {
  let handler: AdjustInventoryHandler;
  let inventories: jest.Mocked<InventoryRepository>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    inventories = {
      findById: jest.fn(),
      findByVariantAndWarehouse: jest.fn(),
      findByWarehouse: jest.fn(),
      findByVariant: jest.fn(),
      findLowInventory: jest.fn(),
      findAll: jest.fn(),
      commit: jest.fn(),
      toDomain: jest.fn(),
    } as unknown as jest.Mocked<InventoryRepository>;
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new AdjustInventoryHandler(inventories, eventBus);
  });

  it('rejects an adjustment that would produce negative stock', async () => {
    inventories.findByVariantAndWarehouse.mockResolvedValue(
      new Inventory(1, 1, 1, 5, 0, 100, new Date(), new Date()),
    );

    await expect(
      handler.execute(new AdjustInventoryCommand(1, 1, -10, 'Damage', 4)),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(inventories.commit).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when no inventory record exists', async () => {
    inventories.findByVariantAndWarehouse.mockResolvedValue(null);

    await expect(
      handler.execute(new AdjustInventoryCommand(99, 99, 5, 'note', 4)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('applies a valid adjustment and publishes InventoryAdjusted', async () => {
    const inventory = new Inventory(1, 1, 1, 50, 0, 100, new Date(), new Date());
    inventories.findByVariantAndWarehouse.mockResolvedValue(inventory);
    inventories.commit.mockImplementation(async (i) => i);

    const result = await handler.execute(new AdjustInventoryCommand(1, 1, -10, 'Breakage', 4));

    expect(result.getTotalQuantity()).toBe(40);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(InventoryAdjusted));
  });
});
