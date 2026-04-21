import { baseApi } from './baseApi';
import type { Brand } from '../../types/product';

export interface BrandFormData {
  name: string;
  description?: string | null;
}

export const brandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<Brand[], void>({
      query: () => '/brands',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Brand' as const, id })),
              { type: 'Brand', id: 'LIST' },
            ]
          : [{ type: 'Brand', id: 'LIST' }],
    }),

    getBrand: builder.query<Brand, number>({
      query: (id) => `/brands/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Brand', id }],
    }),

    createBrand: builder.mutation<Brand, BrandFormData>({
      query: (body) => ({
        url: '/brands',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    updateBrand: builder.mutation<Brand, { id: number } & BrandFormData>({
      query: ({ id, ...body }) => ({
        url: `/brands/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Brand', id },
        { type: 'Brand', id: 'LIST' },
      ],
    }),

    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;
