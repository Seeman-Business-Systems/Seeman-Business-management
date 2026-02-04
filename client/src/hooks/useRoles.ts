import { useGetRolesQuery } from '../store/api/rolesApi';

export function useRoles() {
  const { data: roles = [], isLoading, error, refetch } = useGetRolesQuery();

  return {
    roles,
    isLoading,
    error,
    refetch,
  };
}

export default useRoles;
