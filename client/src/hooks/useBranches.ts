import { useGetBranchesQuery } from '../store/api/branchesApi';

export function useBranches() {
  const { data: branches = [], isLoading, error, refetch } = useGetBranchesQuery();

  return {
    branches,
    isLoading,
    error,
    refetch,
  };
}

export default useBranches;
