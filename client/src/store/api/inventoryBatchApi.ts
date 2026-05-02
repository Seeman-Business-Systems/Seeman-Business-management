import { baseApi } from './baseApi';
import type { InventoryBatch, InventoryBatchItem, CreateBatchRequest, AddBatchItemRequest } from '../../types/inventoryBatch';

export const inventoryBatchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContainers: builder.query<InventoryBatch[], { offloaded?: boolean }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.offloaded !== undefined) q.set('offloaded', String(params.offloaded));
        return `inventory-batches?${q.toString()}`;
      },
      providesTags: ['InventoryBatch'],
    }),

    getContainer: builder.query<InventoryBatch, number>({
      query: (id) => `inventory-batches/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'InventoryBatch', id }],
    }),

    createContainer: builder.mutation<InventoryBatch, CreateBatchRequest>({
      query: (body) => ({ url: 'inventory-batches', method: 'POST', body }),
      invalidatesTags: ['InventoryBatch'],
    }),

    addContainerItem: builder.mutation<InventoryBatchItem, { batchId: number } & AddBatchItemRequest>({
      query: ({ batchId, ...body }) => ({ url: `inventory-batches/${batchId}/items`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'InventoryBatch', id: arg.batchId }],
    }),

    removeContainerItem: builder.mutation<void, { batchId: number; itemId: number }>({
      query: ({ batchId, itemId }) => ({ url: `inventory-batches/${batchId}/items/${itemId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'InventoryBatch', id: arg.batchId }],
    }),

    offloadContainer: builder.mutation<InventoryBatch, number>({
      query: (id) => ({ url: `inventory-batches/${id}/offload`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'InventoryBatch', id }, 'InventoryBatch', 'Inventory'],
    }),
  }),
});

export const {
  useGetContainersQuery,
  useGetContainerQuery,
  useCreateContainerMutation,
  useAddContainerItemMutation,
  useRemoveContainerItemMutation,
  useOffloadContainerMutation,
} = inventoryBatchApi;
