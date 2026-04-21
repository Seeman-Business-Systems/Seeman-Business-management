class SupplyCreated {
  constructor(
    public readonly supplyId: number,
    public readonly supplyNumber: string,
    public readonly saleId: number,
    public readonly branchId: number,
    public readonly itemCount: number,
  ) {}
}

export default SupplyCreated;
