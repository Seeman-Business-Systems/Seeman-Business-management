import Sale from './sale';
import SaleStatus from './sale-status';
import PaymentStatus from './payment-status';
import PaymentMethod from './payment-method';
import SaleLineItem from './sale-line-item';

describe('Sale (domain)', () => {
  const build = (overrides: Partial<{ status: SaleStatus; paymentStatus: PaymentStatus | null; total: number }> = {}) =>
    new Sale(
      1,
      'SALE-2026-001',
      10,
      4,
      1,
      overrides.status ?? SaleStatus.DRAFT,
      overrides.paymentStatus ?? PaymentStatus.PENDING,
      PaymentMethod.CASH,
      100_000,
      0,
      overrides.total ?? 100_000,
      null,
      new Date(),
      new Date(),
      new Date(),
      null,
      [],
      [],
    );

  it('initialises with the supplied identifiers and totals', () => {
    const sale = build();
    expect(sale.getId()).toBe(1);
    expect(sale.getSaleNumber()).toBe('SALE-2026-001');
    expect(sale.getCustomerId()).toBe(10);
    expect(sale.getSoldBy()).toBe(4);
    expect(sale.getBranchId()).toBe(1);
    expect(sale.getTotalAmount()).toBe(100_000);
  });

  it('transitions status through its setter', () => {
    const sale = build();
    sale.setStatus(SaleStatus.FULFILLED);
    expect(sale.getStatus()).toBe(SaleStatus.FULFILLED);
  });

  it('transitions payment status independently of sale status', () => {
    const sale = build();
    sale.setPaymentStatus(PaymentStatus.PAID);
    expect(sale.getPaymentStatus()).toBe(PaymentStatus.PAID);
  });

  it('allows discount adjustments without mutating the subtotal', () => {
    const sale = build();
    const subtotalBefore = sale.getSubtotal();
    sale.setDiscountAmount(5_000);
    expect(sale.getDiscountAmount()).toBe(5_000);
    expect(sale.getSubtotal()).toBe(subtotalBefore);
  });

  it('reassigns ownership when soldBy is changed', () => {
    const sale = build();
    sale.setSoldBy(9);
    expect(sale.getSoldBy()).toBe(9);
  });

  it('soft-deletes via deletedAt without losing identity', () => {
    const sale = build();
    const deletedAt = new Date('2026-06-01');
    sale.setDeletedAt(deletedAt);
    expect(sale.getDeletedAt()).toEqual(deletedAt);
    expect(sale.getId()).toBe(1);
  });

  it('accepts and exposes line items', () => {
    const sale = build();
    const item = new SaleLineItem(undefined, undefined, 1, 2, 50_000, 0, 100_000, new Date(), new Date());
    sale.setLineItems([item]);
    expect(sale.getLineItems()).toHaveLength(1);
    expect(sale.getLineItems()[0].getLineTotal()).toBe(100_000);
  });

  it('supports a null customer for walk-in sales', () => {
    const sale = build();
    sale.setCustomerId(null);
    expect(sale.getCustomerId()).toBeNull();
  });

  it('updates ancillary fields through setters', () => {
    const sale = build();
    sale.setSaleNumber('SALE-2026-099');
    sale.setBranchId(2);
    sale.setPaymentMethod(PaymentMethod.TRANSFER);
    sale.setSubtotal(120_000);
    sale.setTotalAmount(115_000);
    sale.setNotes('Sold under promo');
    const soldAt = new Date('2026-05-01T09:00:00Z');
    sale.setSoldAt(soldAt);
    sale.setCreatedAt(soldAt);
    sale.setUpdatedAt(soldAt);

    expect(sale.getSaleNumber()).toBe('SALE-2026-099');
    expect(sale.getBranchId()).toBe(2);
    expect(sale.getPaymentMethod()).toBe(PaymentMethod.TRANSFER);
    expect(sale.getSubtotal()).toBe(120_000);
    expect(sale.getTotalAmount()).toBe(115_000);
    expect(sale.getNotes()).toBe('Sold under promo');
    expect(sale.getSoldAt()).toEqual(soldAt);
    expect(sale.getCreatedAt()).toEqual(soldAt);
    expect(sale.getUpdatedAt()).toEqual(soldAt);
  });
});
