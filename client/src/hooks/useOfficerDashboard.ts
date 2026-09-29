import { useQuery } from '@tanstack/react-query';
import { dashboardApi, OfficerDashboardResponse } from '../api/dashboard.api';
import { useOfficer } from '../context/OfficerContext';

export const useOfficerDashboard = (department?: string) => {
  const { filters } = useOfficer();
  const selectedDept = department || filters.department || 'ALL';

  const query = useQuery<OfficerDashboardResponse>({
    queryKey: ['officer-dashboard', selectedDept],
    queryFn: () => dashboardApi.getDashboard(selectedDept),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  });

  return {
    dashboardData: query.data,
    kpis: query.data?.kpi,
    charts: query.data?.charts,
    queues: query.data?.queues,
    officerWorkload: query.data?.officerWorkload || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};
