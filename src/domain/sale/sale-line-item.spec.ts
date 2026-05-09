import SaleLineItem from './sale-line-item';

describe('SaleLineItem (domain)', () => {
  const build = (qty = 2, price = 50_000) =>
    new SaleLineItem(
      undefined,
      undefined,
      5,
      qty,
      price,
      0,
      qty * price,
      new Date(),
      new Date(),
      'Bridgestone 195/65R15',
      'BRG-195-65',
    );

  it('exposes display metadata for joined variant data', () => {
    const item = build();
    expect(item.getVariantName()).toBe('Bridgestone 195/65R15');
    expect(item.getSku()).toBe('BRG-195-65');
  });

  it('updates quantity and unit price through setters', () => {
    const item = build();
    item.setQuantity(4);
    item.setUnitPrice(45_000);
    expect(item.getQuantity()).toBe(4);
    expect(item.getUnitPrice()).toBe(45_000);
  });

  it('accepts a saleId once the parent sale is persisted', () => {
    const item = build();
    item.setSaleId(99);
    expect(item.getSaleId()).toBe(99);
  });

  it('updates discount, line total, variant id and timestamps', () => {
    const item = build();
    item.setVariantId(7);
    item.setDiscountAmount(1_000);
    item.setLineTotal(99_000);
    const at = new Date('2026-05-04T11:00:00Z');
    item.setCreatedAt(at);
    item.setUpdatedAt(at);

    expect(item.getVariantId()).toBe(7);
    expect(item.getDiscountAmount()).toBe(1_000);
    expect(item.getLineTotal()).toBe(99_000);
    expect(item.getCreatedAt()).toEqual(at);
    expect(item.getUpdatedAt()).toEqual(at);
  });
});
