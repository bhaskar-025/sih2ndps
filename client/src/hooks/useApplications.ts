import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/applicationService';
import {
  ApplicationFilterParams,
  ApplicationStatus,
  ApplicationItem,
} from '../types/officer.types';

export const useApplications = (params?: ApplicationFilterParams) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['applications', params],
    queryFn: () => applicationService.getApplications(params),
    staleTime: 1000 * 60, // 1 minute
  });

  const raw = query.data;
  const applications: ApplicationItem[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? (raw as any)
    : [];

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
    onMutate: async ({ id, status, remarks, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['application', id] });
      await queryClient.cancelQueries({ queryKey: ['applications'] });

      const prevApp = queryClient.getQueryData<ApplicationItem>(['application', id]);
      if (prevApp) {
        queryClient.setQueryData<ApplicationItem>(['application', id], {
          ...prevApp,
          status,
          remarks: remarks || prevApp.remarks,
          currentStage: stage || prevApp.currentStage,
        });
      }
      return { prevApp };
    },
    onError: (_err, { id }, context) => {
      if (context?.prevApp) {
        queryClient.setQueryData(['application', id], context.prevApp);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      projectId: string;
      approvalId?: string;
      department: string;
      serviceName?: string;
      priority?: string;
      slaDays?: number;
      remarks?: string;
    }) => applicationService.createApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  return {
    applications,
    pagination: raw?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    createApplication: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};

export const useApplication = (id: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['application', id],
    queryFn: () => (id ? applicationService.getApplicationById(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });

  const queryMutation = useMutation({
    mutationFn: ({
      queryText,
      queryId,
      response,
    }: {
      queryText?: string;
      queryId?: string;
      response?: string;
    }) => (id ? applicationService.raiseOrReplyQuery(id, { queryText, queryId, response }) : Promise.reject('No ID')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  return {
    application: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    raiseOrReplyQuery: queryMutation.mutateAsync,
    isQuerying: queryMutation.isPending,
  };
};

export const useOfficerAnalytics = () => {
  return useQuery({
    queryKey: ['officer-analytics'],
    queryFn: () => applicationService.getOfficerAnalytics(),
    staleTime: 1000 * 60 * 2,
  });
};

export default useApplications;
