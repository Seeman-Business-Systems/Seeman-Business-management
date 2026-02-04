import { baseApi } from './baseApi';
import type { Role } from '../../types/auth';

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
      query: () => '/roles',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Role' as const, id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),

    getRole: builder.query<Role, number>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),

    createRole: builder.mutation<Role, { name: string; isManagement: boolean }>({
      query: (body) => ({
        url: '/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    updateRole: builder.mutation<
      Role,
      { id: number; name: string; isManagement: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    deleteRoles: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/roles',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useDeleteRolesMutation,
} = rolesApi;
