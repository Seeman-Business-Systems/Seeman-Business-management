import SetReorderLevels from './set-reorder-levels';
import SetReorderLevelsCommand from './set-reorder-levels.command';
import Inventory from 'src/domain/inventory/inventory';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import { InvalidReorderLevelsException } from 'src/domain/inventory/exceptions';

describe('SetReorderLevels', () => {
  let handler: SetReorderLevels;
  let inventories: jest.Mocked<InventoryRepository>;

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
    handler = new SetReorderLevels(inventories);
  });

  it('rejects a maximum below the supplied minimum', async () => {
    inventories.findByVariantAndWarehouse.mockResolvedValue(
      new Inventory(1, 1, 1, 50, 10, 100, new Date(), new Date()),
    );

    await expect(
      handler.execute(new SetReorderLevelsCommand(1, 1, 50, 30)),
    ).rejects.toBeInstanceOf(InvalidReorderLevelsException);
  });

  it('updates min/max on an existing inventory record', async () => {
    const inventory = new Inventory(1, 1, 1, 50, 10, 100, new Date(), new Date());
    inventories.findByVariantAndWarehouse.mockResolvedValue(inventory);
    inventories.commit.mockImplementation(async (i) => i);

    const result = await handler.execute(new SetReorderLevelsCommand(1, 1, 20, 200));

    expect(result.getMinimumQuantity()).toBe(20);
    expect(result.getMaximumQuantity()).toBe(200);
  });
});
