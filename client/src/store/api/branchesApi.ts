import { baseApi } from './baseApi';
import type { Branch } from '../../types/auth';

export const branchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<Branch[], void>({
      query: () => '/branches',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Branch' as const, id })),
              { type: 'Branch', id: 'LIST' },
            ]
          : [{ type: 'Branch', id: 'LIST' }],
    }),

    getBranch: builder.query<Branch, number>({
      query: (id) => `/branches/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Branch', id }],
    }),
  }),
});

export const { useGetBranchesQuery, useGetBranchQuery } = branchesApi;
