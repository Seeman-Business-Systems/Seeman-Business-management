class WarehouseCreated {
  constructor(
    public readonly warehouseId: number,
    public readonly name: string,
    public readonly branchId: number | null,
    public readonly createdBy: number,
    public readonly createdAt: Date,
  ) {}
}

export default WarehouseCreated;
