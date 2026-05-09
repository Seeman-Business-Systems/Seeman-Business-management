import Supply from './supply';
import SupplyStatus from './supply-status';
import SupplyItem from './supply-item';

describe('Supply (domain)', () => {
  const build = (status = SupplyStatus.DRAFT) =>
    new Supply(1, 'SUP-001', 10, 'SALE-001', 1, status, null, null, [], new Date(), new Date());

  it('reports DRAFT supplies as draft', () => {
    expect(build(SupplyStatus.DRAFT).isDraft()).toBe(true);
    expect(build(SupplyStatus.DRAFT).isFulfilled()).toBe(false);
  });

  it('reports FULFILLED supplies as fulfilled', () => {
    expect(build(SupplyStatus.FULFILLED).isFulfilled()).toBe(true);
    expect(build(SupplyStatus.FULFILLED).isDraft()).toBe(false);
  });

  it('persists items and supplied-by attribution after fulfilment', () => {
    const supply = build();
    const item = new SupplyItem(undefined, 1, 5, 'Variant A', 3, new Date(), 1, 'WH-1');
    supply.setItems([item]);
    supply.setSuppliedBy(7);
    supply.setStatus(SupplyStatus.FULFILLED);
    expect(supply.getItems()).toHaveLength(1);
    expect(supply.getSuppliedBy()).toBe(7);
    expect(supply.getStatus()).toBe(SupplyStatus.FULFILLED);
  });

  it('exposes its sale linkage and branch scope', () => {
    const supply = build();
    expect(supply.getSaleId()).toBe(10);
    expect(supply.getSaleNumber()).toBe('SALE-001');
    expect(supply.getBranchId()).toBe(1);
  });

  it('updates notes and audit timestamp through setters', () => {
    const supply = build();
    const updated = new Date('2026-06-01T09:00:00Z');
    supply.setNotes('Awaiting customer signature');
    supply.setUpdatedAt(updated);
    expect(supply.getNotes()).toBe('Awaiting customer signature');
    expect(supply.getUpdatedAt()).toEqual(updated);
    expect(supply.getCreatedAt()).toBeInstanceOf(Date);
  });
});
