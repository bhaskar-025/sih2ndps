import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    staleTime: 1000 * 60, // 1 min
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<any[]>(['notifications']);
      if (previous) {
        queryClient.setQueryData(
          ['notifications'],
          previous.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = query.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead && !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutateAsync,
  };
};

export default useNotifications;
