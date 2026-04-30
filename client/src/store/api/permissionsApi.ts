import { baseApi } from './baseApi';

export interface RolePermission {
  permission: string;
  granted: boolean;
}

export const permissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRolePermissions: builder.query<RolePermission[], string>({
      query: (roleName) => `/permissions/${encodeURIComponent(roleName)}`,
      providesTags: (_result, _error, roleName) => [{ type: 'Permission', id: roleName }],
    }),

    updatePermission: builder.mutation<RolePermission[], { roleName: string; permission: string; granted: boolean }>({
      query: ({ roleName, ...body }) => ({
        url: `/permissions/${encodeURIComponent(roleName)}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { roleName }) => [{ type: 'Permission', id: roleName }],
    }),
  }),
});

export const { useGetRolePermissionsQuery, useUpdatePermissionMutation } = permissionsApi;
