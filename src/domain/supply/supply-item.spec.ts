import SupplyItem from './supply-item';

describe('SupplyItem (domain)', () => {
  it('initialises without a warehouse assignment by default', () => {
    const item = new SupplyItem(undefined, 1, 5, 'Variant A', 3, new Date());
    expect(item.getWarehouseId()).toBeNull();
    expect(item.getWarehouseName()).toBeNull();
  });

  it('accepts a warehouse assignment through its setter', () => {
    const item = new SupplyItem(undefined, 1, 5, 'Variant A', 3, new Date());
    item.setWarehouseId(7);
    expect(item.getWarehouseId()).toBe(7);
  });

  it('exposes variant identification metadata', () => {
    const item = new SupplyItem(undefined, 1, 5, 'Variant A', 3, new Date());
    expect(item.getVariantId()).toBe(5);
    expect(item.getVariantName()).toBe('Variant A');
    expect(item.getQuantity()).toBe(3);
  });

  it('exposes parent supply id and creation timestamp', () => {
    const at = new Date('2026-05-04T08:00:00Z');
    const item = new SupplyItem(undefined, 99, 5, 'Variant A', 3, at);
    expect(item.getSupplyId()).toBe(99);
    expect(item.getCreatedAt()).toEqual(at);
    item.setSupplyId(100);
    expect(item.getSupplyId()).toBe(100);
  });
});
