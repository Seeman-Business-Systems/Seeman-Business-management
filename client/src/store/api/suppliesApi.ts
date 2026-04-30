import { baseApi } from './baseApi';
import type { Supply, SupplyListResponse } from '../../types/supply';

interface SupplyFilters {
  branchId?: number;
  saleId?: number;
  status?: string;
  suppliedBy?: number;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
  skip?: number;
}

export const suppliesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupplies: builder.query<SupplyListResponse, SupplyFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.branchId) params.append('branchId', String(filters.branchId));
        if (filters?.saleId) params.append('saleId', String(filters.saleId));
        if (filters?.status) params.append('status', filters.status);
        if (filters?.suppliedBy) params.append('suppliedBy', String(filters.suppliedBy));
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        if (filters?.take !== undefined) params.append('take', String(filters.take));
        if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
        const qs = params.toString();
        return `/supplies${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Supply' as const, id })),
              { type: 'Supply', id: 'LIST' },
            ]
          : [{ type: 'Supply', id: 'LIST' }],
    }),

    getSupply: builder.query<Supply, number>({
      query: (id) => `/supplies/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Supply', id }],
    }),

    fulfilSupply: builder.mutation<Supply, { id: number; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/supplies/${id}/fulfil`,
        method: 'PATCH',
        body: notes ? { notes } : {},
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Supply', id },
        { type: 'Supply', id: 'LIST' },
        { type: 'Activity' },
      ],
    }),

    cancelSupply: builder.mutation<Supply, number>({
      query: (id) => ({ url: `/supplies/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Supply', id },
        { type: 'Supply', id: 'LIST' },
        { type: 'Activity' },
      ],
    }),

    assignSupplyItemWarehouse: builder.mutation<Supply, { supplyId: number; itemId: number; warehouseId: number }>({
      query: ({ supplyId, itemId, warehouseId }) => ({
        url: `/supplies/${supplyId}/items/${itemId}/warehouse`,
        method: 'PATCH',
        body: { warehouseId },
      }),
      invalidatesTags: (_result, _err, { supplyId }) => [{ type: 'Supply', id: supplyId }],
    }),
  }),
});

export const {
  useGetSuppliesQuery,
  useGetSupplyQuery,
  useFulfilSupplyMutation,
  useCancelSupplyMutation,
  useAssignSupplyItemWarehouseMutation,
} = suppliesApi;
