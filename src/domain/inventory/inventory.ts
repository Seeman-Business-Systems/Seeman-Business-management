class Inventory {
  constructor(
    private id: number | undefined,
    private variantId: number,
    private warehouseId: number,
    private totalQuantity: number,
    private minimumQuantity: number,
    private maximumQuantity: number | null,
    private createdAt: Date,
    private updatedAt: Date,
    private pendingQuantity: number = 0,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getVariantId(): number {
    return this.variantId;
  }

  setVariantId(variantId: number): void {
    this.variantId = variantId;
  }

  getWarehouseId(): number {
    return this.warehouseId;
  }

  setWarehouseId(warehouseId: number): void {
    this.warehouseId = warehouseId;
  }

  getTotalQuantity(): number {
    return this.totalQuantity;
  }

  setTotalQuantity(totalQuantity: number): void {
    this.totalQuantity = totalQuantity;
  }

  getMinimumQuantity(): number {
    return this.minimumQuantity;
  }

  setMinimumQuantity(minimumQuantity: number): void {
    this.minimumQuantity = minimumQuantity;
  }

  getMaximumQuantity(): number | null {
    return this.maximumQuantity;
  }

  setMaximumQuantity(maximumQuantity: number | null): void {
    this.maximumQuantity = maximumQuantity;
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

  getPendingQuantity(): number {
    return this.pendingQuantity;
  }

  setPendingQuantity(pendingQuantity: number): void {
    this.pendingQuantity = Math.max(0, pendingQuantity);
  }

  getAvailableQuantity(): number {
    return Math.max(0, this.totalQuantity - this.pendingQuantity);
  }

  isLowInventory(): boolean {
    return this.totalQuantity < this.minimumQuantity;
  }
}

export default Inventory;
