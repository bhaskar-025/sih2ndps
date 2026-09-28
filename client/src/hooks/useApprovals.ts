import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapService } from '../services/roadmapService';
import { knowledgeService } from '../services/knowledgeService';
import { ProjectApprovalStatus } from '../types/roadmap.types';

export const useApprovals = (projectId?: string) => {
  const queryClient = useQueryClient();

  const roadmapQuery = useQuery({
    queryKey: ['roadmap', projectId],
    queryFn: () => (projectId ? roadmapService.getRoadmap(projectId) : Promise.reject('No project ID')),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 3,
  });

  const generateMutation = useMutation({
    mutationFn: (pId?: string) => roadmapService.generateRoadmap(pId || projectId!),
    onSuccess: (data, pId) => {
      const targetId = pId || projectId;
      queryClient.setQueryData(['roadmap', targetId], data);
      queryClient.invalidateQueries({ queryKey: ['project', targetId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      approvalId,
      status,
    }: {
      approvalId: string;
      status: ProjectApprovalStatus;
    }) => roadmapService.updateApprovalStatus(approvalId, status),
    onMutate: async ({ approvalId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['roadmap', projectId] });
      const previousRoadmap: any = queryClient.getQueryData(['roadmap', projectId]);
      if (previousRoadmap?.approvals) {
        const updatedApprovals = previousRoadmap.approvals.map((app: any) =>
          app._id === approvalId ? { ...app, status } : app
        );
        queryClient.setQueryData(['roadmap', projectId], {
          ...previousRoadmap,
          approvals: updatedApprovals,
        });
      }
      return { previousRoadmap };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRoadmap) {
        queryClient.setQueryData(['roadmap', projectId], context.previousRoadmap);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', projectId] });
    },
  });

  return {
    roadmap: roadmapQuery.data,
    approvals: roadmapQuery.data?.approvals || [],
    isLoading: roadmapQuery.isLoading,
    isError: roadmapQuery.isError,
    error: roadmapQuery.error,
    refetch: roadmapQuery.refetch,

    generateRoadmap: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,

    updateApprovalStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};

export const useApprovalGuides = (params?: {
  industry?: string;
  department?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['approval-guides', params],
    queryFn: () => knowledgeService.getApprovalGuides(params),
    staleTime: 1000 * 60 * 5,
  });
};

export default useApprovals;
