// Base staff interface (duplicated to avoid circular dependency)
export interface BaseStaff {
  id: number;
  firstName: string;
  lastName: string;
}

// Product Type enum (matches backend)
export const ProductType = {
  TYRE: 1,
  BATTERY: 2,
  SPARE_PART: 3,
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const ProductTypeLabels: Record<ProductType, string> = {
  [ProductType.TYRE]: 'Tyre',
  [ProductType.BATTERY]: 'Battery',
  [ProductType.SPARE_PART]: 'Spare Part',
};

// Product Status enum (matches backend)
export const ProductStatus = {
  ACTIVE: 1,
  INACTIVE: 2,
  DISCONTINUED: 3,
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductStatusLabels: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'Active',
  [ProductStatus.INACTIVE]: 'Inactive',
  [ProductStatus.DISCONTINUED]: 'Discontinued',
};

// Brand interface
export interface Brand {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdBy: BaseStaff | null;
  createdAt: string;
  updatedAt: string;
}

// Category interface
export interface Category {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  parent?: Category | null;
  createdBy: BaseStaff | null;
  createdAt: string;
  updatedAt: string;
}

// Product Variant interface
export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  variantName: string;
  sellingPrice: number;
  specifications: Record<string, unknown> | null;
  createdBy: BaseStaff | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Product interface
export interface Product {
  id: number;
  name: string;
  description: string | null;
  productType: ProductType;
  status: ProductStatus;
  brandId: number;
  categoryId: number;
  brand?: Brand | null;
  category?: Category | null;
  variants: ProductVariant[];
  createdBy: BaseStaff | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Form data interfaces
export interface ProductFormData {
  name: string;
  description: string;
  productType: ProductType | '';
  status: ProductStatus | '';
  brandId: number | '';
  categoryId: number | '';
}

export interface VariantFormData {
  id?: number;
  sku: string;
  variantName: string;
  sellingPrice: string;
  specifications: Record<string, unknown> | null;
}

// API filter interface
export interface ProductFilters {
  name?: string;
  brandId?: number;
  categoryId?: number;
  status?: ProductStatus;
  productType?: ProductType;
  includeRelations?: boolean;
}
