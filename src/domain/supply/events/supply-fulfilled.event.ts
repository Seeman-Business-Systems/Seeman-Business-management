class SupplyFulfilled {
  constructor(
    public readonly supplyId: number,
    public readonly supplyNumber: string,
    public readonly saleId: number,
    public readonly branchId: number,
    public readonly fulfilledBy: number,
  ) {}
}

export default SupplyFulfilled;
