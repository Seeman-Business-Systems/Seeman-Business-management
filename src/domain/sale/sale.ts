import SaleStatus from './sale-status';
import PaymentStatus from './payment-status';
import PaymentMethod from './payment-method';
import SaleLineItem from './sale-line-item';
import SalePayment from './sale-payment';
class Sale {
  constructor(
    private id: number | undefined,
    private saleNumber: string,
    private customerId: number | null,
    private soldBy: number,
    private branchId: number,
    private status: SaleStatus,
    private paymentStatus: PaymentStatus | null,
    private paymentMethod: PaymentMethod | null,
    private subtotal: number,
    private discountAmount: number,
    private totalAmount: number,
    private notes: string | null,
    private soldAt: Date,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private lineItems: SaleLineItem[],
    private payments: SalePayment[],
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getSaleNumber(): string {
    return this.saleNumber;
  }

  setSaleNumber(saleNumber: string): void {
    this.saleNumber = saleNumber;
  }

  getCustomerId(): number | null {
    return this.customerId;
  }

  setCustomerId(customerId: number | null): void {
    this.customerId = customerId;
  }

  getSoldBy(): number {
    return this.soldBy;
  }

  setSoldBy(soldBy: number): void {
    this.soldBy = soldBy;
  }

  getBranchId(): number {
    return this.branchId;
  }

  setBranchId(branchId: number): void {
    this.branchId = branchId;
  }

  getStatus(): SaleStatus {
    return this.status;
  }

  setStatus(status: SaleStatus): void {
    this.status = status;
  }

  getPaymentStatus(): PaymentStatus | null {
    return this.paymentStatus;
  }

  setPaymentStatus(paymentStatus: PaymentStatus | null): void {
    this.paymentStatus = paymentStatus;
  }

  getPaymentMethod(): PaymentMethod | null {
    return this.paymentMethod;
  }

  setPaymentMethod(paymentMethod: PaymentMethod | null): void {
    this.paymentMethod = paymentMethod;
  }

  getSubtotal(): number {
    return this.subtotal;
  }

  setSubtotal(subtotal: number): void {
    this.subtotal = subtotal;
  }

  getDiscountAmount(): number {
    return this.discountAmount;
  }

  setDiscountAmount(discountAmount: number): void {
    this.discountAmount = discountAmount;
  }

  getTotalAmount(): number {
    return this.totalAmount;
  }

  setTotalAmount(totalAmount: number): void {
    this.totalAmount = totalAmount;
  }

  getNotes(): string | null {
    return this.notes;
  }

  setNotes(notes: string | null): void {
    this.notes = notes;
  }

  getSoldAt(): Date {
    return this.soldAt;
  }

  setSoldAt(soldAt: Date): void {
    this.soldAt = soldAt;
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

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  setDeletedAt(deletedAt: Date | null): void {
    this.deletedAt = deletedAt;
  }

  getLineItems(): SaleLineItem[] {
    return this.lineItems;
  }

  setLineItems(lineItems: SaleLineItem[]): void {
    this.lineItems = lineItems;
  }

  getPayments(): SalePayment[] {
    return this.payments;
  }

  setPayments(payments: SalePayment[]): void {
    this.payments = payments;
  }
}

export default Sale;