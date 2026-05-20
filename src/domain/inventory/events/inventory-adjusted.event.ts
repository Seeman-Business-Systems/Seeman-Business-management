class InventoryAdjusted {
  constructor(
    public readonly inventoryId: number,
    public readonly warehouseId: number,
    public readonly warehouseName: string | null,
    public readonly variantId: number,
    public readonly variantName: string | null,
    public readonly adjustmentQuantity: number,
    public readonly actorId: number,
    public readonly notes: string | null,
  ) {}
}

export default InventoryAdjusted;
