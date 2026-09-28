import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  inspectionService,
  InspectionFilterParams,
  InspectionItem,
} from '../services/inspectionService';

export const useInspections = (params?: InspectionFilterParams) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['inspections', params],
    queryFn: () => inspectionService.getInspections(params),
    staleTime: 1000 * 60, // 1 min
  });

  const inspections: InspectionItem[] = Array.isArray(query.data?.data)
    ? query.data.data
    : Array.isArray(query.data)
    ? (query.data as any)
    : [];

  const scheduleMutation = useMutation({
    mutationFn: (payload: Partial<InspectionItem>) =>
      inspectionService.scheduleInspection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      remarks,
      findings,
    }: {
      id: string;
      status: 'Scheduled' | 'Rescheduled' | 'Completed' | 'Cancelled';
      remarks?: string;
      findings?: string;
    }) => inspectionService.updateStatus(id, status, remarks, findings),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspection', id] });
      queryClient.invalidateQueries({ queryKey: ['officer-analytics'] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({
      id,
      newDate,
      newTime,
      reason,
    }: {
      id: string;
      newDate: string;
      newTime?: string;
      reason?: string;
    }) => inspectionService.rescheduleInspection(id, newDate, newTime, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspection', id] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      inspectionService.cancelInspection(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspection', id] });
    },
  });

  return {
    inspections,
    total: (query.data as any)?.total ?? (query.data as any)?.pagination?.total ?? inspections.length,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    scheduleInspection: scheduleMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    rescheduleInspection: rescheduleMutation.mutateAsync,
    cancelInspection: cancelMutation.mutateAsync,
  };
};

export const useInspection = (id: string) => {
  return useQuery({
    queryKey: ['inspection', id],
    queryFn: () => inspectionService.getInspectionById(id),
    enabled: Boolean(id),
  });
};

export default useInspections;
