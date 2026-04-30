import { baseApi } from './baseApi';
import type { Expense, ExpenseFilters, CreateExpenseRequest, UpdateExpenseRequest, ExpenseListResponse } from '../../types/expense';

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<ExpenseListResponse, ExpenseFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.branchId) params.append('branchId', String(filters.branchId));
        if (filters?.category) params.append('category', filters.category);
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        if (filters?.take !== undefined) params.append('take', String(filters.take));
        if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
        const qs = params.toString();
        return `/expenses${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Expense' as const, id })),
              { type: 'Expense', id: 'LIST' },
            ]
          : [{ type: 'Expense', id: 'LIST' }],
    }),

    createExpense: builder.mutation<Expense, CreateExpenseRequest>({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'Activity' },
      ],
    }),

    updateExpense: builder.mutation<Expense, { id: number; data: UpdateExpenseRequest }>({
      query: ({ id, data }) => ({ url: `/expenses/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
      ],
    }),

    deleteExpense: builder.mutation<void, number>({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Expense', id },
        { type: 'Expense', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetExpensesQuery, useCreateExpenseMutation, useUpdateExpenseMutation, useDeleteExpenseMutation } = expensesApi;
