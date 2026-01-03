class Inventory {
  constructor(
    private id: number | undefined,
    private variantId: number,
    private warehouseId: number, //why is this here?
    private totalQuantity: number,
    private minimumQuantity: number,
    private maximumQuantity: number | null,
    private reservedQuantity: number,
    private createdAt: Date,
    private updatedAt: Date,
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

  getReservedQuantity(): number {
    return this.reservedQuantity;
  }

  setReservedQuantity(reservedQuantity: number): void {
    this.reservedQuantity = reservedQuantity;
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

  getAvailableQuantity(): number {
    return this.totalQuantity - this.reservedQuantity;
  }

  isLowStock(): boolean {
    return this.totalQuantity < this.minimumQuantity;
  }
}

export default Inventory;