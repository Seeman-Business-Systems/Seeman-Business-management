import { baseApi } from './baseApi';
import type { Branch, BranchDetail } from '../../types/auth';

export interface BranchFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  altPhoneNumber?: string;
  code?: string;
  managerId?: number;
  isHeadOffice?: boolean;
  status?: string;
}

export interface PaginatedBranchesResponse {
  data: Branch[];
  total: number;
  skip: number;
  take: number;
}

export interface BranchFilters {
  search?: string;
  status?: string;
  city?: string;
  skip?: number;
  take?: number;
}

export const branchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<Branch[], void>({
      query: () => '/branches?take=1000',
      transformResponse: (response: PaginatedBranchesResponse) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Branch' as const, id })),
              { type: 'Branch', id: 'LIST' },
            ]
          : [{ type: 'Branch', id: 'LIST' }],
    }),

    getBranchesPaginated: builder.query<PaginatedBranchesResponse, BranchFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.city && filters.city !== 'all') params.append('city', filters.city);
        if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
        if (filters.take !== undefined) params.append('take', filters.take.toString());
        return `/branches?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Branch' as const, id })),
              { type: 'Branch', id: 'LIST' },
            ]
          : [{ type: 'Branch', id: 'LIST' }],
    }),

    getBranch: builder.query<BranchDetail, number>({
      query: (id) => `/branches/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Branch', id }],
    }),

    createBranch: builder.mutation<Branch, BranchFormData>({
      query: (body) => ({
        url: '/branches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }, { type: 'Activity' }],
    }),

    updateBranch: builder.mutation<Branch, { id: number } & BranchFormData>({
      query: ({ id, ...body }) => ({
        url: `/branches/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Branch', id },
        { type: 'Branch', id: 'LIST' },
      ],
    }),

    deleteBranch: builder.mutation<void, number>({
      query: (id) => ({
        url: `/branches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }],
    }),

    deleteBranches: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/branches',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchesPaginatedQuery,
  useGetBranchQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useDeleteBranchesMutation,
} = branchesApi;
