import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { Project, ProjectFilterParams } from '../types/project.types';

export const useProjects = (params?: ProjectFilterParams) => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const res = await projectService.getProjects(params);
      return res;
    },
    staleTime: 1000 * 60, // 1 minute
  });

  const createProjectMutation = useMutation({
    mutationFn: (newProject: Partial<Project>) => projectService.createProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectService.updateProject(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['project', id] });
      const previousProject = queryClient.getQueryData<Project>(['project', id]);
      if (previousProject) {
        queryClient.setQueryData<Project>(['project', id], {
          ...previousProject,
          ...data,
        });
      }
      return { previousProject };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', id], context.previousProject);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const rawData = projectsQuery.data;
  const projectList: Project[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
    ? rawData.data
    : [];

  return {
    projects: projectList,
    pagination: rawData?.pagination,
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    error: projectsQuery.error,
    refetch: projectsQuery.refetch,

    createProject: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,

    updateProject: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,

    deleteProject: deleteProjectMutation.mutateAsync,
    isDeleting: deleteProjectMutation.isPending,
  };
};

export const useProject = (id: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['project', id],
    queryFn: () => (id ? projectService.getProject(id) : Promise.reject('No ID provided')),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Project>) =>
      id ? projectService.updateProject(id, data) : Promise.reject('No ID'),
    onSuccess: (updated) => {
      queryClient.setQueryData(['project', id], updated);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    project: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export default useProjects;
