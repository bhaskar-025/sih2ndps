import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionApi, InspectionScheduleData, InspectionCompleteData } from '../api/inspection.api';
import { useToast } from '../context/ToastContext';

export const useOfficerInspections = (params?: { status?: string }) => {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const query = useQuery({
    queryKey: ['officer-inspections', params],
    queryFn: () => inspectionApi.getInspections(params),
    staleTime: 1000 * 30,
  });

  const scheduleMutation = useMutation({
    mutationFn: (data: InspectionScheduleData) => inspectionApi.scheduleInspection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-inspections'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard'] });
      toastSuccess('Statutory field inspection scheduled successfully.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to schedule inspection');
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InspectionCompleteData }) =>
      inspectionApi.completeInspection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-inspections'] });
      queryClient.invalidateQueries({ queryKey: ['officer-dashboard'] });
      toastSuccess('Inspection report and outcome certified successfully.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to complete inspection');
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date, remarks }: { id: string; date: string; remarks?: string }) =>
      inspectionApi.rescheduleInspection(id, date, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-inspections'] });
      toastSuccess('Inspection rescheduled successfully.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to reschedule inspection');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      inspectionApi.cancelInspection(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-inspections'] });
      toastSuccess('Inspection cancelled.');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to cancel inspection');
    },
  });

  return {
    inspections: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    scheduleInspection: scheduleMutation.mutateAsync,
    isScheduling: scheduleMutation.isPending,
    completeInspection: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    rescheduleInspection: rescheduleMutation.mutateAsync,
    isRescheduling: rescheduleMutation.isPending,
    cancelInspection: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
};
