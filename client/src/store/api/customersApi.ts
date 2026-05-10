import { baseApi } from './baseApi';
import type {
  Customer,
  CustomerFilters,
  CustomerListResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '../../types/customer';

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomerListResponse, CustomerFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.name) params.append('name', filters.name);
        if (filters?.phoneNumber) params.append('phoneNumber', filters.phoneNumber);
        if (filters?.email) params.append('email', filters.email);
        if (filters?.hasOutstandingBalance) params.append('hasOutstandingBalance', 'true');
        if (filters?.branchId) params.append('branchId', String(filters.branchId));
        if (filters?.take !== undefined) params.append('take', String(filters.take));
        if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
        const qs = params.toString();
        return `/customers${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Customer' as const, id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    getCustomer: builder.query<Customer, number>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),

    createCustomer: builder.mutation<Customer, CreateCustomerRequest>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }, { type: 'Activity' }],
    }),

    updateCustomer: builder.mutation<Customer, { id: number; data: UpdateCustomerRequest }>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    deleteCustomer: builder.mutation<void, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
