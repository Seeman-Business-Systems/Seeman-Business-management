class InventoryTransferred {
  constructor(
    public readonly batchId: number,
    public readonly fromWarehouseId: number,
    public readonly toWarehouseId: number,
    public readonly variantId: number,
    public readonly quantity: number,
    public readonly actorId: number,
  ) {}
}

export default InventoryTransferred;
