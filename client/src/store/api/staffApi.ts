import { baseApi } from './baseApi';
import type { Staff } from '../../types/auth';

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<Staff, number>({
      query: (id) => `/staff/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Staff' as const, id }],
    }),
  }),
});

export const { useGetStaffQuery } = staffApi;