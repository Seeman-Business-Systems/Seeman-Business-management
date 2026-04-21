export interface SaleCreatedLineItem {
  variantId: number;
  variantName: string | undefined;
  quantity: number;
  unitPrice: number;
}

class SaleCreated {
  constructor(
    public readonly saleId: number,
    public readonly saleNumber: string,
    public readonly branchId: number,
    public readonly soldBy: number,
    public readonly totalAmount: number,
    public readonly lineItems: SaleCreatedLineItem[],
    public readonly customerId: number | null,
  ) {}
}

export default SaleCreated;
