import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapService } from '../services/roadmapService';
import { ProjectApprovalStatus } from '../types/roadmap.types';

export const useRoadmap = (projectId?: string) => {
  const queryClient = useQueryClient();

  const roadmapQuery = useQuery({
    queryKey: ['roadmap', projectId],
    queryFn: () => roadmapService.getRoadmap(projectId!),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const generateRoadmapMutation = useMutation({
    mutationFn: () => roadmapService.generateRoadmap(projectId!),
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmap', projectId], data);
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ approvalId, status }: { approvalId: string; status: ProjectApprovalStatus }) =>
      roadmapService.updateApprovalStatus(approvalId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', projectId] });
    },
  });

  return {
    roadmap: roadmapQuery.data,
    isLoading: roadmapQuery.isLoading,
    isError: roadmapQuery.isError,
    error: roadmapQuery.error,
    refetch: roadmapQuery.refetch,
    generateRoadmap: generateRoadmapMutation.mutateAsync,
    isGenerating: generateRoadmapMutation.isPending,
    generateError: generateRoadmapMutation.error,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};

export default useRoadmap;
