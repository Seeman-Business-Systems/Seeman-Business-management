class ContainerOffloaded {
  constructor(
    public readonly batchId: number,
    public readonly batchNumber: string,
    public readonly offloadedBy: number,
    public readonly itemCount: number,
    public readonly totalUnits: number,
    public readonly warehouseIds: number[],
  ) {}
}

export default ContainerOffloaded;
