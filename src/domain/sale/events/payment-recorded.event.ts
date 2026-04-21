class PaymentRecorded {
  constructor(
    public readonly saleId: number,
    public readonly saleNumber: string,
    public readonly branchId: number,
    public readonly amount: number,
    public readonly recordedBy: number,
  ) {}
}

export default PaymentRecorded;
