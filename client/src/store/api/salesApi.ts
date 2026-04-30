import { baseApi } from './baseApi';
import type {
  Sale,
  SaleFilters,
  CreateSaleRequest,
  RecordPaymentRequest,
  SalePayment,
  PaginatedSalesResponse,
} from '../../types/sale';

interface UpdateSaleRequest {
  notes?: string | null;
  paymentMethod?: string | null;
  status?: string;
}

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<PaginatedSalesResponse, SaleFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.branchId) params.append('branchId', filters.branchId.toString());
        if (filters?.customerId) params.append('customerId', filters.customerId.toString());
        if (filters?.status) params.append('status', filters.status);
        if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.take !== undefined) params.append('take', filters.take.toString());
        if (filters?.skip !== undefined) params.append('skip', filters.skip.toString());
        const queryString = params.toString();
        return `/sales${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Sale' as const, id })),
              { type: 'Sale', id: 'LIST' },
            ]
          : [{ type: 'Sale', id: 'LIST' }],
    }),

    getSale: builder.query<Sale, number>({
      query: (id) => `/sales/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Sale', id }],
    }),

    createSale: builder.mutation<Sale, CreateSaleRequest>({
      query: (body) => ({
        url: '/sales',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Sale', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Supply', id: 'LIST' },
        { type: 'Customer', id: 'LIST' },
        { type: 'Activity' },
      ],
    }),

    recordPayment: builder.mutation<SalePayment, { saleId: number; data: RecordPaymentRequest }>({
      query: ({ saleId, data }) => ({
        url: `/sales/${saleId}/payments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { saleId }) => [
        { type: 'Sale', id: saleId },
        { type: 'Sale', id: 'LIST' },
        { type: 'Customer', id: 'LIST' },
        { type: 'Activity' },
      ],
    }),

    updateSale: builder.mutation<Sale, { id: number; data: UpdateSaleRequest }>({
      query: ({ id, data }) => ({
        url: `/sales/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sale', id },
        { type: 'Sale', id: 'LIST' },
      ],
    }),

    cancelSale: builder.mutation<Sale, number>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Sale', id },
        { type: 'Sale', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Supply', id: 'LIST' },
        { type: 'Customer', id: 'LIST' },
        { type: 'Activity' },
      ],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useRecordPaymentMutation,
  useCancelSaleMutation,
} = salesApi;
