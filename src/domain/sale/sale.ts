import SaleStatus from './sale-status';
import PaymentStatus from './payment-status';
import PaymentMethod from './payment-method';
import SaleLineItem from './sale-line-item';
import SalePayment from './sale-payment';

export interface SaleCustomer {
  id: number;
  name: string;
  phoneNumber: string;
  email: string | null;
}

export interface SaleSoldBy {
  id: number;
  firstName: string;
  lastName: string;
}

export interface SaleBranch {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phoneNumber: string | null;
}

class Sale {
  constructor(
    private id: number | undefined,
    private saleNumber: string,
    private customerId: number | null,
    private soldBy: number,
    private branchId: number,
    private status: SaleStatus,
    private paymentStatus: PaymentStatus,
    private paymentMethod: PaymentMethod,
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
    // Extra display data from joined entities
    private customer?: SaleCustomer | null,
    private soldByData?: SaleSoldBy | null,
    private branchData?: SaleBranch | null,
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

  getPaymentStatus(): PaymentStatus {
    return this.paymentStatus;
  }

  setPaymentStatus(paymentStatus: PaymentStatus): void {
    this.paymentStatus = paymentStatus;
  }

  getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  setPaymentMethod(paymentMethod: PaymentMethod): void {
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

  getCustomer(): SaleCustomer | null | undefined {
    return this.customer;
  }

  getSoldByData(): SaleSoldBy | null | undefined {
    return this.soldByData;
  }

  getBranchData(): SaleBranch | null | undefined {
    return this.branchData;
  }
}

export default Sale;
