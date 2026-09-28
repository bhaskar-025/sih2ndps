import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['dashboard-overview-metrics'],
    queryFn: () => analyticsService.getOverviewMetrics(),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
};

export const useAuditLogs = (params?: {
  entity?: string;
  action?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => analyticsService.getAuditLogs(params),
    staleTime: 1000 * 60,
  });
};

export const useAuditStats = () => {
  return useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => analyticsService.getAuditStats(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useWorkflowHistory = (applicationId: string | undefined) => {
  return useQuery({
    queryKey: ['workflow-history', applicationId],
    queryFn: () =>
      applicationId
        ? analyticsService.getWorkflowHistory(applicationId)
        : Promise.reject('No application ID'),
    enabled: Boolean(applicationId),
    staleTime: 1000 * 60 * 2,
  });
};

export default useAnalytics;
