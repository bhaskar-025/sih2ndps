import { useQuery } from '@tanstack/react-query';
import { departmentApi, DepartmentItem } from '../api/department.api';

export const useDepartmentRegistry = () => {
  const query = useQuery<DepartmentItem[]>({
    queryKey: ['department-registry'],
    queryFn: () => departmentApi.getDepartments(),
    staleTime: 1000 * 60,
  });

  return {
    departments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
