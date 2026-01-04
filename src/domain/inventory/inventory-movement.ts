import InventoryMovementType from './inventory-movement-type';

class InventoryMovement {
  constructor(
    private id: number | undefined,
    private inventoryBatchId: number,
    private type: InventoryMovementType,
    private quantity: number,
    private orderId: number | null,
    private fromWarehouseId: number | null,
    private toWarehouseId: number | null,
    private notes: string | null,
    private actorId: number,
    private createdAt: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getInventoryBatchId(): number {
    return this.inventoryBatchId;
  }

  setInventoryBatchId(inventoryBatchId: number): void {
    this.inventoryBatchId = inventoryBatchId;
  }

  getType(): InventoryMovementType {
    return this.type;
  }

  setType(type: InventoryMovementType): void {
    this.type = type;
  }

  getQuantity(): number {
    return this.quantity;
  }

  setQuantity(quantity: number): void {
    this.quantity = quantity;
  }

  getOrderId(): number | null {
    return this.orderId;
  }

  setOrderId(orderId: number | null): void {
    this.orderId = orderId;
  }

  getFromWarehouseId(): number | null {
    return this.fromWarehouseId;
  }

  setFromWarehouseId(fromWarehouseId: number | null): void {
    this.fromWarehouseId = fromWarehouseId;
  }

  getToWarehouseId(): number | null {
    return this.toWarehouseId;
  }

  setToWarehouseId(toWarehouseId: number | null): void {
    this.toWarehouseId = toWarehouseId;
  }

  getNotes(): string | null {
    return this.notes;
  }

  setNotes(notes: string | null): void {
    this.notes = notes;
  }

  getActorId(): number {
    return this.actorId;
  }

  setActorId(actorId: number): void {
    this.actorId = actorId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  isInbound(): boolean {
    return this.type === InventoryMovementType.IN;
  }

  isOutbound(): boolean {
    return this.type === InventoryMovementType.OUT;
  }

  isAdjustment(): boolean {
    return this.type === InventoryMovementType.ADJUST;
  }

  isTransfer(): boolean {
    return this.type === InventoryMovementType.TRANSFER;
  }
}

export default InventoryMovement;