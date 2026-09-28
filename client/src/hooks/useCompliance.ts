import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  complianceService,
  ComplianceFilterParams,
  ComplianceStatus,
  ComplianceItem,
} from '../services/complianceService';

export const useCompliance = (params?: ComplianceFilterParams) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['compliances', params],
    queryFn: () => complianceService.getCompliances(params),
    staleTime: 1000 * 60,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      remarks,
    }: {
      id: string;
      status: ComplianceStatus;
      remarks?: string;
    }) => complianceService.updateStatus(id, status, remarks),
    onMutate: async ({ id, status, remarks }) => {
      await queryClient.cancelQueries({ queryKey: ['compliances'] });
      const previousData: any = queryClient.getQueryData(['compliances', params]);
      if (previousData?.items) {
        const updatedItems = previousData.items.map((item: ComplianceItem) =>
          item._id === id ? { ...item, status, remarks: remarks || item.remarks } : item
        );
        queryClient.setQueryData(['compliances', params], {
          ...previousData,
          items: updatedItems,
        });
      }
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['compliances', params], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      queryClient.invalidateQueries({ queryKey: ['project-compliances'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-score'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<ComplianceItem>) => complianceService.createCompliance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliances'] });
      queryClient.invalidateQueries({ queryKey: ['project-compliances'] });
    },
  });

  return {
    compliances: query.data?.items || [],
    total: query.data?.total || 0,
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    createCompliance: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};

export const useProjectCompliances = (projectId?: string) => {
  return useQuery({
    queryKey: ['project-compliances', projectId],
    queryFn: () => (projectId ? complianceService.getProjectCompliances(projectId) : Promise.resolve([])),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 2,
  });
};

export const useComplianceScore = (projectId?: string) => {
  return useQuery({
    queryKey: ['compliance-score', projectId],
    queryFn: () => (projectId ? complianceService.getComplianceScore(projectId) : Promise.reject('No ID')),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 3,
  });
};

export const useComplianceReminders = (projectId?: string) => {
  return useQuery({
    queryKey: ['compliance-reminders', projectId],
    queryFn: () => complianceService.getReminders(projectId),
    staleTime: 1000 * 60 * 2,
  });
};

export default useCompliance;
