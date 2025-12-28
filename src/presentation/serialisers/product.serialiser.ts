import { Injectable } from '@nestjs/common';
import Product from 'src/domain/product/product';
import ProductVariant from 'src/domain/product/product-variant';
import BrandRepository from 'src/infrastructure/database/repositories/product/brand.repository';
import CategoryRepository from 'src/infrastructure/database/repositories/product/category.repository';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffSerialiser } from './staff.serialiser';
import BrandSerialiser from './brand.serialiser';
import CategorySerialiser from './category.serialiser';

@Injectable()
class ProductSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly brands: BrandRepository,
    private readonly categories: CategoryRepository,
    private readonly variants: ProductVariantRepository,
    private readonly staffSerialiser: StaffSerialiser,
    private readonly brandSerialiser: BrandSerialiser,
    private readonly categorySerialiser: CategorySerialiser,
  ) {}

  async serialise(product: Product, includeRelations: boolean = false) {
    const creator = await this.staff.findById(product.getCreatedBy());

    const result: any = {
      id: product.getId(),
      name: product.getName(),
      description: product.getDescription(),
      productType: product.getProductType(),
      status: product.getStatus(),
      brandId: product.getBrandId(),
      categoryId: product.getCategoryId(),
      createdBy: creator ? this.staffSerialiser.serialise(creator) : null,
      createdAt: product.getCreatedAt(),
      updatedAt: product.getUpdatedAt(),
      deletedAt: product.getDeletedAt(),
    };

    // Always include variants
    const productVariants = await this.variants.findByProductId(product.getId()!);
    result.variants = await this.serialiseVariants(productVariants);

    if (includeRelations) {
      const brand = await this.brands.findById(product.getBrandId());
      result.brand = brand ? await this.brandSerialiser.serialise(brand) : null;

      const category = await this.categories.findById(product.getCategoryId());
      result.category = category
        ? await this.categorySerialiser.serialise(category)
        : null;
    }

    return result;
  }

  async serialiseMany(products: Product[], includeRelations: boolean = false) {
    return Promise.all(
      products.map((product) => this.serialise(product, includeRelations)),
    );
  }

  async serialiseVariant(variant: ProductVariant) {
    const creator = await this.staff.findById(variant.getCreatedBy());

    return {
      id: variant.getId(),
      productId: variant.getProductId(),
      sku: variant.getSku(),
      variantName: variant.getVariantName(),
      price: variant.getPrice(),
      specifications: variant.getSpecifications(),
      createdBy: creator ? this.staffSerialiser.serialise(creator) : null,
      createdAt: variant.getCreatedAt(),
      updatedAt: variant.getUpdatedAt(),
      deletedAt: variant.getDeletedAt(),
    };
  }

  async serialiseVariants(variants: ProductVariant[]) {
    return Promise.all(variants.map((variant) => this.serialiseVariant(variant)));
  }
}

export default ProductSerialiser;
