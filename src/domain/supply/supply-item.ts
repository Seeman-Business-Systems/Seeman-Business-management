class SupplyItem {
  constructor(
    private id: number | undefined,
    private supplyId: number,
    private variantId: number,
    private variantName: string | null,
    private quantity: number,
    private createdAt: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getSupplyId(): number {
    return this.supplyId;
  }

  setSupplyId(supplyId: number): void {
    this.supplyId = supplyId;
  }

  getVariantId(): number {
    return this.variantId;
  }

  getVariantName(): string | null {
    return this.variantName;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

export default SupplyItem;
