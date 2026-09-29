import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationApi, ApplicationQueryParams } from '../api/application.api';
import { useToast } from '../context/ToastContext';

export const useOfficerApplications = (params?: ApplicationQueryParams) => {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const query = useQuery({
    queryKey: ['officer-applications', params],
    queryFn: () => applicationApi.getApplications(params),
    staleTime: 1000 * 30,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: string; remarks?: string }) =>
      applicationApi.updateStatus(id, { status, remarks }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard'] });
      toastSuccess(`Application transitioned to "${updated.status}"`);
    },
    onError: (err: any) => {
      toastError(err.message || 'Status transition failed');
    },
  });

  const assignOfficerMutation = useMutation({
    mutationFn: ({ appId, officerId }: { appId: string; officerId: string }) =>
      applicationApi.assignOfficer(appId, officerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard'] });
      toastSuccess('Officer assigned successfully.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to assign officer');
    },
  });

  const forwardDepartmentMutation = useMutation({
    mutationFn: ({ appId, toDepartment, remarks }: { appId: string; toDepartment: string; remarks?: string }) =>
      applicationApi.forwardDepartment(appId, toDepartment, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard'] });
      toastSuccess('Application forwarded to designated department.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to forward application');
    },
  });

  const escalateMutation = useMutation({
    mutationFn: ({ appId, reason }: { appId: string; reason: string }) =>
      applicationApi.escalateApplication(appId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard'] });
      toastSuccess('Application escalated under statutory review.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to escalate application');
    },
  });

  const generateNocMutation = useMutation({
    mutationFn: ({ appId, remarks }: { appId: string; remarks?: string }) =>
      applicationApi.generateNoc(appId, remarks),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['officer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard'] });
      toastSuccess(`Clearance NOC Issued: ${data.certificateNumber || 'Success'}`);
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to issue statutory NOC');
    },
  });

  return {
    applications: query.data?.data || [],
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    assignOfficer: assignOfficerMutation.mutateAsync,
    isAssigning: assignOfficerMutation.isPending,
    forwardDepartment: forwardDepartmentMutation.mutateAsync,
    isForwarding: forwardDepartmentMutation.isPending,
    escalateApplication: escalateMutation.mutateAsync,
    isEscalating: escalateMutation.isPending,
    generateNoc: generateNocMutation.mutateAsync,
    isGeneratingNoc: generateNocMutation.isPending,
  };
};
