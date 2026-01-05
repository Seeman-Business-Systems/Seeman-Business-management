import ReservationStatus from './reservation-status';

class StockReservation {
  constructor(
    private id: number | undefined,
    private variantId: number,
    private warehouseId: number,
    private orderId: number | null,
    private customerId: number | null,
    private quantity: number,
    private reservedBy: number,
    private reservedAt: Date,
    private expiresAt: Date | null,
    private status: ReservationStatus,
    private notes: string | null,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getVariantId(): number {
    return this.variantId;
  }

  getWarehouseId(): number {
    return this.warehouseId;
  }

  getOrderId(): number | null {
    return this.orderId;
  }

  setOrderId(orderId: number | null): void {
    this.orderId = orderId;
  }

  getCustomerId(): number | null {
    return this.customerId;
  }

  setCustomerId(customerId: number | null): void {
    this.customerId = customerId;
  }

  getQuantity(): number {
    return this.quantity;
  }

  setQuantity(quantity: number): void {
    this.quantity = quantity;
  }

  getReservedBy(): number {
    return this.reservedBy;
  }

  getReservedAt(): Date {
    return this.reservedAt;
  }

  getExpiresAt(): Date | null {
    return this.expiresAt;
  }

  setExpiresAt(expiresAt: Date | null): void {
    this.expiresAt = expiresAt;
  }

  getStatus(): ReservationStatus {
    return this.status;
  }

  setStatus(status: ReservationStatus): void {
    this.status = status;
  }

  getNotes(): string | null {
    return this.notes;
  }

  setNotes(notes: string | null): void {
    this.notes = notes;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  isActive(): boolean {
    return this.status === ReservationStatus.ACTIVE;
  }

  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return this.expiresAt < new Date() && this.status === ReservationStatus.ACTIVE;
  }

  cancel(): void {
    this.status = ReservationStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  fulfill(): void {
    this.status = ReservationStatus.FULFILLED;
    this.updatedAt = new Date();
  }

  markAsExpired(): void {
    this.status = ReservationStatus.EXPIRED;
    this.updatedAt = new Date();
  }
}

export default StockReservation;