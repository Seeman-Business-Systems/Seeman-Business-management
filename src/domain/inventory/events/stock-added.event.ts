class StockAdded {
  constructor(
    public readonly inventoryId: number,
    public readonly variantId: number,
    public readonly warehouseId: number,
    public readonly quantity: number,
    public readonly actorId: number,
    public readonly notes: string | null,
  ) {}
}

export default StockAdded;
