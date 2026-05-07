import SalePayment from './sale-payment';
import PaymentMethod from './payment-method';

describe('SalePayment (domain)', () => {
  const build = (amount = 25_000) =>
    new SalePayment(undefined, 1, amount, PaymentMethod.CASH, null, null, 4, new Date(), new Date(), new Date());

  it('captures the recording staff id for accountability', () => {
    expect(build().getRecordedBy()).toBe(4);
  });

  it('updates amount and method through setters', () => {
    const payment = build();
    payment.setAmount(30_000);
    payment.setPaymentMethod(PaymentMethod.TRANSFER);
    expect(payment.getAmount()).toBe(30_000);
    expect(payment.getPaymentMethod()).toBe(PaymentMethod.TRANSFER);
  });

  it('allows null reference and notes for cash payments', () => {
    const payment = build();
    expect(payment.getReference()).toBeNull();
    expect(payment.getNotes()).toBeNull();
  });

  it('updates audit fields and references through setters', () => {
    const payment = build();
    payment.setSaleId(7);
    payment.setReference('TXN-1234');
    payment.setNotes('Bank confirmation pending');
    payment.setRecordedBy(8);
    const at = new Date('2026-05-04T10:30:00Z');
    payment.setRecordedAt(at);
    payment.setCreatedAt(at);
    payment.setUpdatedAt(at);

    expect(payment.getSaleId()).toBe(7);
    expect(payment.getReference()).toBe('TXN-1234');
    expect(payment.getNotes()).toBe('Bank confirmation pending');
    expect(payment.getRecordedBy()).toBe(8);
    expect(payment.getRecordedAt()).toEqual(at);
    expect(payment.getCreatedAt()).toEqual(at);
    expect(payment.getUpdatedAt()).toEqual(at);
  });
});
