import InventoryBatchStatus from './inventory-batch-status';

class InventoryBatch {
  constructor(
    private id: number | undefined,
    private inventoryId: number,
    private warehouseId: number,
    private batchNumber: string,
    private supplierId: number,
    private quantityReceived: number,
    private currentQuantity: number,
    private costPricePerUnit: number,
    private status: InventoryBatchStatus,
    private receivedDate: Date | null,
    private expiryDate: Date | null,
    private createdBy: number,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getInventoryId(): number {
    return this.inventoryId;
  }

  setInventoryId(inventoryId: number): void {
    this.inventoryId = inventoryId;
  }

  getWarehouseId(): number {
    return this.warehouseId;
  }

  setWarehouseId(warehouseId: number): void {
    this.warehouseId = warehouseId;
  }

  getBatchNumber(): string {
    return this.batchNumber;
  }

  setBatchNumber(batchNumber: string): void {
    this.batchNumber = batchNumber;
  }

  getSupplierId(): number {
    return this.supplierId;
  }

  setSupplierId(supplierId: number): void {
    this.supplierId = supplierId;
  }

  getQuantityReceived(): number {
    return this.quantityReceived;
  }

  setQuantityReceived(quantityReceived: number): void {
    this.quantityReceived = quantityReceived;
  }

  getCurrentQuantity(): number {
    return this.currentQuantity;
  }

  setCurrentQuantity(currentQuantity: number): void {
    this.currentQuantity = currentQuantity;
  }

  getCostPricePerUnit(): number {
    return this.costPricePerUnit;
  }

  setCostPricePerUnit(costPricePerUnit: number): void {
    this.costPricePerUnit = costPricePerUnit;
  }

  getStatus(): InventoryBatchStatus {
    return this.status;
  }

  setStatus(status: InventoryBatchStatus): void {
    this.status = status;
  }

  getReceivedDate(): Date | null {
    return this.receivedDate;
  }

  setReceivedDate(receivedDate: Date | null): void {
    this.receivedDate = receivedDate;
  }

  getExpiryDate(): Date | null {
    return this.expiryDate;
  }

  setExpiryDate(expiryDate: Date | null): void {
    this.expiryDate = expiryDate;
  }

  getCreatedBy(): number {
    return this.createdBy;
  }

  setCreatedBy(createdBy: number): void {
    this.createdBy = createdBy;
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

  isArrived(): boolean {
    return this.status === InventoryBatchStatus.ARRIVED;
  }

  isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  canTransfer(): boolean {
    return this.currentQuantity > 0 && this.isArrived();
  }
}

export default InventoryBatch;