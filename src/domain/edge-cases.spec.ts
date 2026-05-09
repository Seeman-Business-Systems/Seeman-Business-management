import Inventory from './inventory/inventory';
import Sale from './sale/sale';
import SaleStatus from './sale/sale-status';
import PaymentStatus from './sale/payment-status';
import PaymentMethod from './sale/payment-method';
import Supply from './supply/supply';
import SupplyStatus from './supply/supply-status';
import SupplyItem from './supply/supply-item';
import Customer from './customer/customer';
import Staff from './staff/staff';

describe('Edge cases', () => {
  it('treats inventory at exactly zero as low when minimum is positive', () => {
    const inventory = new Inventory(1, 1, 1, 0, 5, 100, new Date(), new Date());
    expect(inventory.isLowInventory()).toBe(true);
    expect(inventory.getAvailableQuantity()).toBe(0);
  });

  it('preserves an empty line-items collection on a freshly constructed sale', () => {
    const sale = new Sale(
      undefined,
      'SALE-NEW',
      null,
      4,
      1,
      SaleStatus.DRAFT,
      PaymentStatus.PENDING,
      PaymentMethod.CASH,
      0,
      0,
      0,
      null,
      new Date(),
      new Date(),
      new Date(),
      null,
      [],
      [],
    );
    expect(sale.getLineItems()).toEqual([]);
    expect(sale.getPayments()).toEqual([]);
    expect(sale.getId()).toBeUndefined();
  });

  it('returns null for unassigned warehouse on a freshly created supply item', () => {
    const item = new SupplyItem(undefined, 1, 5, null, 3, new Date());
    expect(item.getWarehouseId()).toBeNull();
    expect(item.getWarehouseName()).toBeNull();
    expect(item.getVariantName()).toBeNull();
  });

  it('returns null for unset deletedAt on a customer that has not been removed', () => {
    const customer = new Customer(1, 'Walk-in', null, null, '+2348000000000', null, null, 0, 0, 4, 1, new Date(), new Date());
    expect(customer.getDeletedAt()).toBeUndefined();
    expect(customer.getEmail()).toBeNull();
    expect(customer.getCompanyName()).toBeNull();
  });

  it('renders a staff full name even when middle name is undefined', () => {
    const staff = new Staff(
      1,
      'Tunde',
      'Lawal',
      '+2348021000010',
      5,
      2,
      new Date(),
      new Date(),
      'pwd',
      0,
      true,
    );
    expect(staff.getFullName()).toBe('Tunde Lawal');
    expect(staff.getMiddleName()).toBeUndefined();
    expect(staff.getEmail()).toBeUndefined();
    expect(staff.getJoinedAt()).toBeUndefined();
  });

  it('reports neither draft nor fulfilled when supply has been cancelled', () => {
    const supply = new Supply(1, 'SUP-001', 10, 'SALE-001', 1, SupplyStatus.CANCELLED, null, null, [], new Date(), new Date());
    expect(supply.isDraft()).toBe(false);
    expect(supply.isFulfilled()).toBe(false);
  });

  it('handles inventory with unbounded maximum quantity (null upper cap)', () => {
    const inventory = new Inventory(1, 1, 1, 1_000_000, 10, null, new Date(), new Date());
    expect(inventory.getMaximumQuantity()).toBeNull();
    expect(inventory.isLowInventory()).toBe(false);
  });
});
