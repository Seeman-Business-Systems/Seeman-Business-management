import { baseApi } from './baseApi';
import type { DashboardSummary, DashboardSummaryArgs } from '../../types/analytics';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, DashboardSummaryArgs>({
      query: ({ branchId, dateFrom, dateTo }) => {
        const params = new URLSearchParams({ dateFrom, dateTo });
        if (branchId) params.append('branchId', branchId.toString());
        return `/analytics/summary?${params.toString()}`;
      },
      providesTags: [
        { type: 'Sale', id: 'LIST' },
        { type: 'Expense', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Supply', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = analyticsApi;
