class InventoryAdjusted {
  constructor(
    public readonly batchId: number,
    public readonly warehouseId: number,
    public readonly variantId: number,
    public readonly adjustmentQuantity: number,
    public readonly actorId: number,
    public readonly notes: string | null,
  ) {}
}

export default InventoryAdjusted;
