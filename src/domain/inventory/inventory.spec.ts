import Inventory from './inventory';

describe('Inventory (domain)', () => {
  const build = (qty = 50, min = 10, max: number | null = 100) =>
    new Inventory(1, 1, 1, qty, min, max, new Date(), new Date());

  it('exposes its identity and warehouse linkage', () => {
    const inventory = build();
    expect(inventory.getId()).toBe(1);
    expect(inventory.getVariantId()).toBe(1);
    expect(inventory.getWarehouseId()).toBe(1);
  });

  it('reports available quantity equal to total quantity', () => {
    expect(build(75).getAvailableQuantity()).toBe(75);
  });

  it('flags low inventory when total falls below minimum', () => {
    expect(build(5, 10).isLowInventory()).toBe(true);
  });

  it('does not flag low inventory at or above minimum', () => {
    expect(build(10, 10).isLowInventory()).toBe(false);
    expect(build(50, 10).isLowInventory()).toBe(false);
  });

  it('updates total quantity through its setter', () => {
    const inventory = build(50);
    inventory.setTotalQuantity(80);
    expect(inventory.getTotalQuantity()).toBe(80);
  });

  it('accepts a null maximum quantity (no upper cap configured)', () => {
    const inventory = build(50, 10, null);
    expect(inventory.getMaximumQuantity()).toBeNull();
  });

  it('updates reorder bounds through setters', () => {
    const inventory = build(50, 10, 100);
    inventory.setMinimumQuantity(20);
    inventory.setMaximumQuantity(200);
    expect(inventory.getMinimumQuantity()).toBe(20);
    expect(inventory.getMaximumQuantity()).toBe(200);
  });

  it('refreshes the updatedAt timestamp', () => {
    const inventory = build();
    const later = new Date('2030-01-01');
    inventory.setUpdatedAt(later);
    expect(inventory.getUpdatedAt()).toEqual(later);
  });
});
