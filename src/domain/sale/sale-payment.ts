import PaymentMethod from './payment-method';

class SalePayment {
  constructor(
    private id: number | undefined,
    private saleId: number | undefined,
    private amount: number,
    private paymentMethod: PaymentMethod | undefined,
    private reference: string | null,
    private notes: string | null,
    private recordedBy: number,
    private recordedAt: Date,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getSaleId(): number | undefined {
    return this.saleId;
  }

  setSaleId(saleId: number): void {
    this.saleId = saleId;
  }

  getAmount(): number {
    return this.amount;
  }

  setAmount(amount: number): void {
    this.amount = amount;
  }

  getPaymentMethod(): PaymentMethod | undefined {
    return this.paymentMethod;
  }

  setPaymentMethod(paymentMethod: PaymentMethod): void {
    this.paymentMethod = paymentMethod;
  }

  getReference(): string | null {
    return this.reference;
  }

  setReference(reference: string | null): void {
    this.reference = reference;
  }

  getNotes(): string | null {
    return this.notes;
  }

  setNotes(notes: string | null): void {
    this.notes = notes;
  }

  getRecordedBy(): number {
    return this.recordedBy;
  }

  setRecordedBy(recordedBy: number): void {
    this.recordedBy = recordedBy;
  }

  getRecordedAt(): Date {
    return this.recordedAt;
  }

  setRecordedAt(recordedAt: Date): void {
    this.recordedAt = recordedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }
}

export default SalePayment;
