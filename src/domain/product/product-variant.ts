class ProductVariant {
  constructor(
    public id: number | undefined,
    public productId: number,
    public sku: string,
    public variantName: string,
    public sellingPrice: number,
    public specifications: Record<string, any> | null,
    public createdBy: number,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getProductId(): number {
    return this.productId;
  }

  setProductId(productId: number): void {
    this.productId = productId;
  }

  getSku(): string {
    return this.sku;
  }

  setSku(sku: string): void {
    this.sku = sku;
  }

  getVariantName(): string {
    return this.variantName;
  }

  setVariantName(variantName: string): void {
    this.variantName = variantName;
  }

  getSellingPrice(): number {
    return this.sellingPrice;
  }

  setSellingPrice(sellingPrice: number): void {
    this.sellingPrice = sellingPrice;
  }

  getSpecifications(): Record<string, any> | null {
    return this.specifications;
  }

  setSpecifications(specifications: Record<string, any> | null): void {
    this.specifications = specifications;
  }

  getCreatedBy(): number {
    return this.createdBy;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  setDeletedAt(deletedAt: Date | undefined): void {
    this.deletedAt = deletedAt;
  }
}

export default ProductVariant;
