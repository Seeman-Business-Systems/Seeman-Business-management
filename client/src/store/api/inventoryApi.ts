import { baseApi } from './baseApi';
import type { InventoryRecord, InventoryFilters, SetReorderLevelsRequest, AdjustInventoryRequest, AddStockRequest } from '../../types/inventory';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryRecord[], InventoryFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.variantId) params.append('variantId', filters.variantId.toString());
        if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId.toString());
        if (filters?.lowInventory) params.append('lowInventory', 'true');
        const queryString = params.toString();
        return `/inventory${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Inventory' as const, id })),
              { type: 'Inventory', id: 'LIST' },
            ]
          : [{ type: 'Inventory', id: 'LIST' }],
    }),

    setReorderLevels: builder.mutation<InventoryRecord, SetReorderLevelsRequest>({
      query: (body) => ({
        url: '/inventory/reorder-levels',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),

    addStock: builder.mutation<InventoryRecord, AddStockRequest>({
      query: (body) => ({
        url: '/inventory/add-stock',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Activity' }],
    }),

    adjustInventory: builder.mutation<InventoryRecord, AdjustInventoryRequest>({
      query: (body) => ({
        url: '/inventory/adjust',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Activity' }],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useLazyGetInventoryQuery,
  useSetReorderLevelsMutation,
  useAddStockMutation,
  useAdjustInventoryMutation,
} = inventoryApi;
