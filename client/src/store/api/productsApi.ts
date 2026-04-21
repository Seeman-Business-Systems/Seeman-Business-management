import { baseApi } from './baseApi';
import type {
  Product,
  ProductVariant,
  ProductFilters,
  ProductFormData,
  VariantFormData,
  ProductType,
  ProductStatus,
} from '../../types/product';

// API request types
interface CreateProductRequest {
  name: string;
  description?: string | null;
  productType: ProductType;
  status: ProductStatus;
  brandId: number;
  categoryId: number;
}

interface UpdateProductRequest {
  id: number;
  name?: string;
  description?: string | null;
  productType?: ProductType;
  status?: ProductStatus;
  brandId?: number;
  categoryId?: number;
}

interface CreateVariantRequest {
  productId: number;
  sku: string;
  variantName: string;
  sellingPrice: number;
  specifications?: Record<string, unknown> | null;
}

interface UpdateVariantRequest {
  productId: number;
  variantId: number;
  sku?: string;
  variantName?: string;
  sellingPrice?: number;
  specifications?: Record<string, unknown> | null;
}

interface DeleteVariantRequest {
  productId: number;
  variantId: number;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products with optional filters
    getProducts: builder.query<Product[], ProductFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.name) params.append('name', filters.name);
        if (filters?.brandId) params.append('brandId', filters.brandId.toString());
        if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
        if (filters?.status) params.append('status', filters.status.toString());
        if (filters?.productType) params.append('productType', filters.productType.toString());
        if (filters?.includeRelations) params.append('includeRelations', 'true');
        const queryString = params.toString();
        return `/products${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Get single product by ID
    getProduct: builder.query<Product, { id: number; includeRelations?: boolean }>({
      query: ({ id, includeRelations }) =>
        `/products/${id}${includeRelations ? '?includeRelations=true' : ''}`,
      providesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),

    // Create product
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Activity' }],
    }),

    // Update product
    updateProduct: builder.mutation<Product, UpdateProductRequest>({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Inventory', id: 'LIST' }],
    }),

    // Get product variants
    getProductVariants: builder.query<ProductVariant[], number>({
      query: (productId) => `/products/${productId}/variants`,
      providesTags: (result, _error, productId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ProductVariant' as const, id })),
              { type: 'ProductVariant', id: `PRODUCT_${productId}` },
            ]
          : [{ type: 'ProductVariant', id: `PRODUCT_${productId}` }],
    }),

    // Create product variant
    createProductVariant: builder.mutation<ProductVariant, CreateVariantRequest>({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/variants`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'ProductVariant', id: `PRODUCT_${productId}` },
        { type: 'Product', id: productId },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),

    // Update product variant
    updateProductVariant: builder.mutation<ProductVariant, UpdateVariantRequest>({
      query: ({ productId, variantId, ...body }) => ({
        url: `/products/${productId}/variants/${variantId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { productId, variantId }) => [
        { type: 'ProductVariant', id: variantId },
        { type: 'ProductVariant', id: `PRODUCT_${productId}` },
        { type: 'Product', id: productId },
      ],
    }),

    // Delete product variant
    deleteProductVariant: builder.mutation<void, DeleteVariantRequest>({
      query: ({ productId, variantId }) => ({
        url: `/products/${productId}/variants/${variantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'ProductVariant', id: `PRODUCT_${productId}` },
        { type: 'Product', id: productId },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductVariantsQuery,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} = productsApi;
