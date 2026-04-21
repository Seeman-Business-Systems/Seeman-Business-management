import { baseApi } from './baseApi';
import type { Warehouse } from '../../types/inventory';

export interface CreateWarehouseRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  warehouseType: number;
  status?: string;
  branchId?: number | null;
  capacity?: number | null;
}

export type UpdateWarehouseRequest = Partial<CreateWarehouseRequest>;

export const warehousesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouses: builder.query<Warehouse[], { branchId?: number } | void>({
      query: (params) => {
        if (params?.branchId) return `/warehouses?branchId=${params.branchId}`;
        return '/warehouses';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Warehouse' as const, id })),
              { type: 'Warehouse', id: 'LIST' },
            ]
          : [{ type: 'Warehouse', id: 'LIST' }],
    }),

    getWarehouse: builder.query<Warehouse, number>({
      query: (id) => `/warehouses/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Warehouse', id }],
    }),

    createWarehouse: builder.mutation<Warehouse, CreateWarehouseRequest>({
      query: (body) => ({ url: '/warehouses', method: 'POST', body }),
      invalidatesTags: [{ type: 'Warehouse', id: 'LIST' }, { type: 'Activity' }],
    }),

    updateWarehouse: builder.mutation<Warehouse, { id: number; data: UpdateWarehouseRequest }>({
      query: ({ id, data }) => ({ url: `/warehouses/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
      ],
    }),

    deleteWarehouse: builder.mutation<void, number>({
      query: (id) => ({ url: `/warehouses/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehousesApi;
