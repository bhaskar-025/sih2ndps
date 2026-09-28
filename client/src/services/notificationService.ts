import api from './api';

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Success' | 'Action_Required';
  isRead: boolean;
  relatedEntityType?: 'Application' | 'Approval' | 'Inspection' | 'ComplianceTask' | 'Project' | 'System';
  relatedEntityId?: string;
  createdAt: string;
  updatedAt?: string;
}

export const notificationService = {
  getNotifications: async (params?: { limit?: number; unreadOnly?: boolean }): Promise<NotificationItem[]> => {
    const res = await api.get('/notifications', { params });
    const payload = res.data;
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
  },

  markAsRead: async (id: string): Promise<NotificationItem> => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data?.data || res.data;
  },

  createNotification: async (data: Partial<NotificationItem>): Promise<NotificationItem> => {
    const res = await api.post('/notifications', data);
    return res.data?.data || res.data;
  },
};

export default notificationService;
