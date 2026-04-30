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
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = analyticsApi;
