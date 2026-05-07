import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import FulfilSupplyHandler from '../src/application/supply/commands/fulfil-supply/fulfil-supply.handler';
import FulfilSupplyCommand from '../src/application/supply/commands/fulfil-supply/fulfil-supply.command';
import SupplyRepository from '../src/infrastructure/database/repositories/supply/supply.repository';
import InventoryRepository from '../src/infrastructure/database/repositories/inventory/inventory.repository';
import Supply from '../src/domain/supply/supply';
import SupplyItem from '../src/domain/supply/supply-item';
import SupplyStatus from '../src/domain/supply/supply-status';
import Inventory from '../src/domain/inventory/inventory';
import SupplyFulfilled from '../src/domain/supply/events/supply-fulfilled.event';

describe('Fulfil Supply (integration)', () => {
  let module: TestingModule;
  let commandBus: CommandBus;
  let eventBus: EventBus;
  let supplies: jest.Mocked<SupplyRepository>;
  let inventories: jest.Mocked<InventoryRepository>;
  let publishedEvents: IEvent[];

  const buildSupply = (status: SupplyStatus, items: SupplyItem[]) =>
    new Supply(1, 'SUP-2026-001', 10, 'SALE-2026-001', 1, status, null, null, items, new Date(), new Date());

  beforeEach(async () => {
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

    module = await Test.createTestingModule({
      imports: [CqrsModule.forRoot()],
      providers: [
        FulfilSupplyHandler,
        { provide: SupplyRepository, useValue: supplies },
        { provide: InventoryRepository, useValue: inventories },
      ],
    }).compile();

    await module.init();

    commandBus = module.get(CommandBus);
    eventBus = module.get(EventBus);

    publishedEvents = [];
    eventBus.subscribe((event) => publishedEvents.push(event));
  });

  afterEach(async () => {
    await module.close();
  });

  it('routes FulfilSupplyCommand through the bus, deducts stock, and publishes SupplyFulfilled', async () => {
    const item = new SupplyItem(undefined, 1, 5, 'Pirelli 195/65 R15', 4, new Date(), 1, 'WH-Lagos');
    const supply = buildSupply(SupplyStatus.DRAFT, [item]);
    const inventory = new Inventory(1, 5, 1, 30, 5, 100, new Date(), new Date());

    supplies.findById.mockResolvedValue(supply);
    inventories.findByVariantAndWarehouse.mockResolvedValue(inventory);
    inventories.commit.mockImplementation(async (i) => i);
    supplies.commit.mockImplementation(async (s) => s);

    const result = await commandBus.execute(new FulfilSupplyCommand(1, 7, 'Customer collected'));

    expect(result.getStatus()).toBe(SupplyStatus.FULFILLED);
    expect(result.getSuppliedBy()).toBe(7);
    expect(result.getNotes()).toBe('Customer collected');
    expect(inventory.getTotalQuantity()).toBe(26);
    expect(inventories.commit).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setImmediate(resolve));
    const fulfilled = publishedEvents.find((e): e is SupplyFulfilled => e instanceof SupplyFulfilled);
    expect(fulfilled).toBeDefined();
    expect(fulfilled!.supplyId).toBe(1);
    expect(fulfilled!.fulfilledBy).toBe(7);
  });

  it('rejects fulfilment when stock is insufficient and does not publish an event', async () => {
    const item = new SupplyItem(undefined, 1, 5, 'Pirelli 195/65 R15', 50, new Date(), 1, 'WH-Lagos');
    const supply = buildSupply(SupplyStatus.DRAFT, [item]);
    const inventory = new Inventory(1, 5, 1, 10, 5, 100, new Date(), new Date());

    supplies.findById.mockResolvedValue(supply);
    inventories.findByVariantAndWarehouse.mockResolvedValue(inventory);

    await expect(commandBus.execute(new FulfilSupplyCommand(1, 7))).rejects.toBeInstanceOf(
      BadRequestException,
    );

    await new Promise((resolve) => setImmediate(resolve));
    expect(publishedEvents).toHaveLength(0);
    expect(supplies.commit).not.toHaveBeenCalled();
    expect(inventories.commit).not.toHaveBeenCalled();
  });

  it('returns NotFoundException when the supply id does not exist', async () => {
    supplies.findById.mockResolvedValue(null);

    await expect(commandBus.execute(new FulfilSupplyCommand(999, 7))).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(inventories.findByVariantAndWarehouse).not.toHaveBeenCalled();
  });

  it('rejects fulfilment when an item has no warehouse assignment', async () => {
    const item = new SupplyItem(undefined, 1, 5, 'Pirelli 195/65 R15', 4, new Date());
    const supply = buildSupply(SupplyStatus.DRAFT, [item]);

    supplies.findById.mockResolvedValue(supply);

    await expect(commandBus.execute(new FulfilSupplyCommand(1, 7))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(inventories.findByVariantAndWarehouse).not.toHaveBeenCalled();
  });

  it('rejects fulfilment of a supply that is no longer in DRAFT status', async () => {
    supplies.findById.mockResolvedValue(buildSupply(SupplyStatus.FULFILLED, []));

    await expect(commandBus.execute(new FulfilSupplyCommand(1, 7))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
