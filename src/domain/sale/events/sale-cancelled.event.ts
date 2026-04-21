class SaleCancelled {
  constructor(
    public readonly saleId: number,
    public readonly saleNumber: string,
    public readonly branchId: number,
    public readonly cancelledBy: number,
    public readonly totalAmount: number,
  ) {}
}

export default SaleCancelled;
