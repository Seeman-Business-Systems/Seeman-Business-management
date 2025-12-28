import ProductStatus from './product-status';
import ProductType from './product-type';

class Product {
  constructor(
    public id: number | undefined,
    public name: string,
    public description: string | null,
    public productType: ProductType,
    public status: ProductStatus,
    public brandId: number,
    public categoryId: number,
    public createdBy: number,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt?: Date,
  ) {}

  getId(): number | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getDescription(): string | null {
    return this.description;
  }

  setDescription(description: string | null): void {
    this.description = description;
  }

  getProductType(): ProductType {
    return this.productType;
  }

  setProductType(productType: ProductType): void {
    this.productType = productType;
  }

  getStatus(): ProductStatus {
    return this.status;
  }

  setStatus(status: ProductStatus): void {
    this.status = status;
  }

  getBrandId(): number {
    return this.brandId;
  }

  setBrandId(brandId: number): void {
    this.brandId = brandId;
  }

  getCategoryId(): number {
    return this.categoryId;
  }

  setCategoryId(categoryId: number): void {
    this.categoryId = categoryId;
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

export default Product;
