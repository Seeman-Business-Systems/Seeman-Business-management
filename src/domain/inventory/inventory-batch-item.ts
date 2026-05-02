class InventoryBatchItem {
  constructor(
    private id: number | undefined,
    private batchId: number,
    private variantId: number,
    private warehouseId: number,
    private quantity: number,
  ) {}

  getId(): number | undefined { return this.id; }
  getBatchId(): number { return this.batchId; }
  getVariantId(): number { return this.variantId; }
  setVariantId(v: number): void { this.variantId = v; }
  getWarehouseId(): number { return this.warehouseId; }
  setWarehouseId(v: number): void { this.warehouseId = v; }
  getQuantity(): number { return this.quantity; }
  setQuantity(v: number): void { this.quantity = v; }
}

export default InventoryBatchItem;
