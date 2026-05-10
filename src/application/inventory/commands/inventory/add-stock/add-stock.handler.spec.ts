import { EventBus } from '@nestjs/cqrs';
import AddStockHandler from './add-stock.handler';
import AddStockCommand from './add-stock.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';
import StockAdded from 'src/domain/inventory/events/stock-added.event';

describe('AddStockHandler', () => {
  let handler: AddStockHandler;
  let inventories: jest.Mocked<InventoryRepository>;
  let variants: jest.Mocked<ProductVariantRepository>;
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
    variants = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<ProductVariantRepository>;
    eventBus = { publish: jest.fn() } as unknown as jest.Mocked<EventBus>;
    handler = new AddStockHandler(inventories, variants, eventBus);
  });

  it('increases existing inventory totalQuantity by the added amount', async () => {
    // Arrange
    const inventory = new Inventory(1, 1, 1, 50, 0, 100, new Date(), new Date());
    inventories.findByVariantAndWarehouse.mockResolvedValue(inventory);
    inventories.commit.mockImplementation(async (i) => i);
    const command = new AddStockCommand(1, 1, 20, 'Container arrival', 4);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result.getTotalQuantity()).toBe(70);
    expect(inventories.commit).toHaveBeenCalledWith(inventory);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(StockAdded));
  });

  it('creates a new inventory record when none exists for the variant/warehouse', async () => {
    inventories.findByVariantAndWarehouse.mockResolvedValue(null);
    inventories.commit.mockImplementation(async (i) => {
      // Simulate persistence assigning an id
      const created = new Inventory(
        7,
        i.getVariantId(),
        i.getWarehouseId(),
        i.getTotalQuantity(),
        i.getMinimumQuantity(),
        i.getMaximumQuantity(),
        i.getCreatedAt(),
        i.getUpdatedAt(),
      );
      return created;
    });

    const result = await handler.execute(new AddStockCommand(2, 3, 15, null, 4));

    expect(result.getId()).toBe(7);
    expect(result.getTotalQuantity()).toBe(15);
    expect(result.getMinimumQuantity()).toBe(0);
  });

  it('publishes a StockAdded event with the originating actor', async () => {
    const inventory = new Inventory(9, 1, 1, 10, 0, 50, new Date(), new Date());
    inventories.findByVariantAndWarehouse.mockResolvedValue(inventory);
    inventories.commit.mockResolvedValue(inventory);

    await handler.execute(new AddStockCommand(1, 1, 5, 'Top up', 4));

    const event = (eventBus.publish as jest.Mock).mock.calls[0][0] as StockAdded;
    expect(event.actorId).toBe(4);
    expect(event.quantity).toBe(5);
    expect(event.inventoryId).toBe(9);
  });
});
