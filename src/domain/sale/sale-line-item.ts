class SaleLineItem {
  constructor(
    private id: number | undefined,
    private saleId: number | undefined,
    private variantId: number,
    private quantity: number,
    private unitPrice: number,
    private discountAmount: number,
    private lineTotal: number,
    private createdAt: Date,
    private updatedAt: Date,
    // Extra display data from joined entity
    private variantName?: string,
    private sku?: string,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getSaleId(): number | undefined {
    return this.saleId;
  }

  setSaleId(saleId: number): void {
    this.saleId = saleId;
  }

  getVariantId(): number {
    return this.variantId;
  }

  setVariantId(variantId: number): void {
    this.variantId = variantId;
  }

  getQuantity(): number {
    return this.quantity;
  }

  setQuantity(quantity: number): void {
    this.quantity = quantity;
  }

  getUnitPrice(): number {
    return this.unitPrice;
  }

  setUnitPrice(unitPrice: number): void {
    this.unitPrice = unitPrice;
  }

  getDiscountAmount(): number {
    return this.discountAmount;
  }

  setDiscountAmount(discountAmount: number): void {
    this.discountAmount = discountAmount;
  }

  getLineTotal(): number {
    return this.lineTotal;
  }

  setLineTotal(lineTotal: number): void {
    this.lineTotal = lineTotal;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  getVariantName(): string | undefined {
    return this.variantName;
  }

  getSku(): string | undefined {
    return this.sku;
  }
}

export default SaleLineItem;
