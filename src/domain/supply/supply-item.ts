class SupplyItem {
  constructor(
    private id: number | undefined,
    private supplyId: number,
    private variantId: number,
    private variantName: string | null,
    private quantity: number,
    private createdAt: Date,
    private warehouseId: number | null = null,
    private warehouseName: string | null = null,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getSupplyId(): number {
    return this.supplyId;
  }

  setSupplyId(supplyId: number): void {
    this.supplyId = supplyId;
  }

  getVariantId(): number {
    return this.variantId;
  }

  getVariantName(): string | null {
    return this.variantName;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getWarehouseId(): number | null {
    return this.warehouseId;
  }

  setWarehouseId(warehouseId: number): void {
    this.warehouseId = warehouseId;
  }

  getWarehouseName(): string | null {
    return this.warehouseName;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

export default SupplyItem;
