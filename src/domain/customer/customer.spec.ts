import Customer from './customer';

describe('Customer (domain)', () => {
  const build = (creditLimit = 100_000, outstanding = 25_000) =>
    new Customer(1, 'Chukwu', null, null, '+2348011111111', null, null, creditLimit, outstanding, 4, 1, new Date(), new Date());

  it('computes available credit as limit minus outstanding balance', () => {
    expect(build(100_000, 25_000).getAvailableCredit()).toBe(75_000);
  });

  it('returns negative available credit when outstanding exceeds limit', () => {
    expect(build(50_000, 60_000).getAvailableCredit()).toBe(-10_000);
  });

  it('exposes its branch scope and creator', () => {
    const customer = build();
    expect(customer.getBranchId()).toBe(1);
    expect(customer.getCreatedBy()).toBe(4);
  });

  it('reassigns branch through its setter (e.g. transfer)', () => {
    const customer = build();
    customer.setBranchId(2);
    expect(customer.getBranchId()).toBe(2);
  });

  it('updates outstanding balance for credit reconciliation', () => {
    const customer = build();
    customer.setOutstandingBalance(40_000);
    expect(customer.getOutstandingBalance()).toBe(40_000);
    expect(customer.getAvailableCredit()).toBe(60_000);
  });

  it('updates contact details through setters', () => {
    const customer = build();
    customer.setName('Adaeze Trading');
    customer.setPhoneNumber('+2348022222222');
    customer.setAltPhoneNumber('+2348033333333');
    customer.setEmail('adaeze@trading.com');
    customer.setNotes('Prefers cash');
    customer.setCompanyName('Adaeze Trading Co.');

    expect(customer.getName()).toBe('Adaeze Trading');
    expect(customer.getPhoneNumber()).toBe('+2348022222222');
    expect(customer.getAltPhoneNumber()).toBe('+2348033333333');
    expect(customer.getEmail()).toBe('adaeze@trading.com');
    expect(customer.getNotes()).toBe('Prefers cash');
    expect(customer.getCompanyName()).toBe('Adaeze Trading Co.');
  });

  it('updates credit limit through its setter', () => {
    const customer = build();
    customer.setCreditLimit(250_000);
    expect(customer.getCreditLimit()).toBe(250_000);
  });

  it('reassigns creator and updates audit timestamps', () => {
    const customer = build();
    const updated = new Date('2026-02-01');
    customer.setCreatedBy(8);
    customer.setUpdatedAt(updated);
    expect(customer.getCreatedBy()).toBe(8);
    expect(customer.getUpdatedAt()).toEqual(updated);
  });

  it('soft-deletes via deletedAt', () => {
    const customer = build();
    const at = new Date('2026-12-01');
    customer.setDeletedAt(at);
    expect(customer.getDeletedAt()).toEqual(at);
  });
});
