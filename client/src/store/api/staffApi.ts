import { baseApi } from './baseApi';
import type { Staff } from '../../types/auth';

interface StaffListResponse {
  data: Staff[];
  total: number;
}

interface StaffListFilters {
  branchId?: number;
  take?: number;
  skip?: number;
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<Staff, number>({
      query: (id) => `/staff/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Staff' as const, id }],
    }),

    getStaffList: builder.query<StaffListResponse, StaffListFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        params.set('take', String(filters?.take ?? 1000));
        if (filters?.skip) params.set('skip', String(filters.skip));
        if (filters?.branchId) params.set('branchId', String(filters.branchId));
        return `/staff?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Staff' as const, id })),
              { type: 'Staff', id: 'LIST' },
            ]
          : [{ type: 'Staff', id: 'LIST' }],
    }),

    transferStaff: builder.mutation<Staff, { id: number; branchId: number }>({
      query: ({ id, branchId }) => ({
        url: `/staff/${id}/transfer`,
        method: 'PATCH',
        body: { branchId },
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Staff', id },
        { type: 'Staff', id: 'LIST' },
        { type: 'Activity' },
      ],
    }),
  }),
});

export const { useGetStaffQuery, useGetStaffListQuery, useTransferStaffMutation } = staffApi;