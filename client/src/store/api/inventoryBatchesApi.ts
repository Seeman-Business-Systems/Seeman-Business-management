import { baseApi } from './baseApi';
import type { InventoryBatch, CreateInventoryBatchRequest } from '../../types/inventory';

export const inventoryBatchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInventoryBatch: builder.mutation<InventoryBatch, CreateInventoryBatchRequest>({
      query: (body) => ({
        url: '/inventory-batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),

    receiveInventoryBatch: builder.mutation<InventoryBatch, number>({
      query: (id) => ({
        url: `/inventory-batches/${id}/receive`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Activity' }],
    }),
  }),
});

export const { useCreateInventoryBatchMutation, useReceiveInventoryBatchMutation } = inventoryBatchesApi;
