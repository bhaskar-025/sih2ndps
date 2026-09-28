import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/applicationService';
import {
  ApplicationFilterParams,
  ApplicationStatus,
} from '../types/officer.types';

export const useOfficerApplications = (params?: ApplicationFilterParams) => {
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ['officer-applications', params],
    queryFn: () => applicationService.getApplications(params),
    staleTime: 1000 * 60, // 1 min
  });

  const analyticsQuery = useQuery({
    queryKey: ['officer-analytics'],
    queryFn: () => applicationService.getOfficerAnalytics(),
    staleTime: 1000 * 60 * 2,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      remarks,
      stage,
    }: {
      id: string;
      status: ApplicationStatus;
      remarks?: string;
      stage?: string;
    }) => applicationService.updateStatus(id, { status, remarks, stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
    },
  });

  const queryMutation = useMutation({
    mutationFn: ({
      id,
      queryText,
      queryId,
      response,
    }: {
      id: string;
      queryText?: string;
      queryId?: string;
      response?: string;
    }) => applicationService.raiseOrReplyQuery(id, { queryText, queryId, response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
    },
  });

  const assignOfficerMutation = useMutation({
    mutationFn: ({ id, officerId }: { id: string; officerId: string }) =>
      applicationService.assignOfficer(id, officerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
    },
  });

  const scheduleInspectionMutation = useMutation({
    mutationFn: ({
      id,
      inspectionDate,
      inspectorId,
      remarks,
      checklist,
    }: {
      id: string;
      inspectionDate: string;
      inspectorId?: string;
      remarks?: string;
      checklist?: any[];
    }) =>
      applicationService.scheduleInspection(id, {
        inspectionDate,
        inspectorId,
        remarks,
        checklist,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
    },
  });

  return {
    applications: applicationsQuery.data?.data || [],
    pagination: applicationsQuery.data?.pagination,
    isLoading: applicationsQuery.isLoading,
    isError: applicationsQuery.isError,
    error: applicationsQuery.error,
    refetch: applicationsQuery.refetch,

    analytics: analyticsQuery.data,
    isAnalyticsLoading: analyticsQuery.isLoading,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    raiseOrReplyQuery: queryMutation.mutateAsync,
    isQuerying: queryMutation.isPending,

    assignOfficer: assignOfficerMutation.mutateAsync,
    isAssigning: assignOfficerMutation.isPending,

    scheduleInspection: scheduleInspectionMutation.mutateAsync,
    isSchedulingInspection: scheduleInspectionMutation.isPending,
  };
};

export default useOfficerApplications;
