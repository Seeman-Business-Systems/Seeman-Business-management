import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import FulfilSupplyHandler from './fulfil-supply.handler';
import FulfilSupplyCommand from './fulfil-supply.command';
import Supply from 'src/domain/supply/supply';
import SupplyItem from 'src/domain/supply/supply-item';
import SupplyStatus from 'src/domain/supply/supply-status';
import Inventory from 'src/domain/inventory/inventory';
import SupplyFulfilled from 'src/domain/supply/events/supply-fulfilled.event';
import SupplyRepository from 'src/infrastructure/database/repositories/supply/supply.repository';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';

describe('FulfilSupplyHandler', () => {
  let handler: FulfilSupplyHandler;
  let supplies: jest.Mocked<SupplyRepository>;
  let inventories: jest.Mocked<InventoryRepository>;
  let eventBus: jest.Mocked<EventBus>;

  const buildSupply = (
    status: SupplyStatus,
    items: SupplyItem[] = [],
  ) => new Supply(1, 'SUP-001', 10, 'SALE-001', 1, status, null, null, items, new Date(), new Date());

  beforeEach(() => {
    supplies = {
      findById: jest.fn(),
      findBySale: jest.fn(),
      commit: jest.fn(),
      toDomain: jest.fn(),
    } as unknown as jest.Mocked<SupplyRepository>;
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
    handler = new FulfilSupplyHandler(supplies, inventories, eventBus);
  });

  it('deducts inventory for each item and marks supply FULFILLED', async () => {
    const item = new SupplyItem(undefined, 1, 5, 'Variant A', 10, new Date(), 1, 'WH-1');
    const supply = buildSupply(SupplyStatus.DRAFT, [item]);
    const inventory = new Inventory(1, 5, 1, 50, 0, 100, new Date(), new Date());

    supplies.findById.mockResolvedValue(supply);
    inventories.findByVariantAndWarehouse.mockResolvedValue(inventory);
    inventories.commit.mockImplementation(async (i) => i);
    supplies.commit.mockImplementation(async (s) => s);

    const result = await handler.execute(new FulfilSupplyCommand(1, 4));

    expect(inventory.getTotalQuantity()).toBe(40);
    expect(result.getStatus()).toBe(SupplyStatus.FULFILLED);
    expect(result.getSuppliedBy()).toBe(4);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(SupplyFulfilled));
  });

  it('rejects fulfilment when stock is insufficient', async () => {
    const item = new SupplyItem(undefined, 1, 5, 'Variant A', 100, new Date(), 1, 'WH-1');
    const supply = buildSupply(SupplyStatus.DRAFT, [item]);
    const inventory = new Inventory(1, 5, 1, 10, 0, 100, new Date(), new Date());

    supplies.findById.mockResolvedValue(supply);
    inventories.findByVariantAndWarehouse.mockResolvedValue(inventory);

    await expect(handler.execute(new FulfilSupplyCommand(1, 4))).rejects.toBeInstanceOf(BadRequestException);
    expect(supplies.commit).not.toHaveBeenCalled();
  });

  it('rejects fulfilment when an item has no warehouse assigned', async () => {
    const item = new SupplyItem(undefined, 1, 5, 'Variant A', 10, new Date()); // no warehouse
    const supply = buildSupply(SupplyStatus.DRAFT, [item]);

    supplies.findById.mockResolvedValue(supply);

    await expect(handler.execute(new FulfilSupplyCommand(1, 4))).rejects.toBeInstanceOf(BadRequestException);
    expect(inventories.findByVariantAndWarehouse).not.toHaveBeenCalled();
  });

  it('rejects fulfilment of a non-DRAFT supply', async () => {
    supplies.findById.mockResolvedValue(buildSupply(SupplyStatus.FULFILLED, []));

    await expect(handler.execute(new FulfilSupplyCommand(1, 4))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when supply is missing', async () => {
    supplies.findById.mockResolvedValue(null);

    await expect(handler.execute(new FulfilSupplyCommand(99, 4))).rejects.toBeInstanceOf(NotFoundException);
  });
});
