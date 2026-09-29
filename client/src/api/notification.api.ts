import { apiClient } from './client';
import mockNotificationsData from './mockData/mockNotifications.json';

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'Approval' | 'Query' | 'Inspection' | 'Reminder';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export const notificationApi = {
  /**
   * Fetches real-time notification stream for logged-in officer
   */
  async getNotifications(params?: { unreadOnly?: boolean }): Promise<NotificationItem[]> {
    return apiClient.executeWithFallback(
      () => apiClient.get('/notifications', { params }),
      () => {
        let list = [...mockNotificationsData] as NotificationItem[];
        if (params?.unreadOnly) {
          list = list.filter((n) => !n.read);
        }
        return list;
      },
      'notifications'
    );
  },

  /**
   * Marks single notification as read
   */
  async markAsRead(id: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.patch(`/notifications/${id}/read`),
      () => ({ success: true, id, read: true }),
      `notifications/${id}/read`
    );
  },

  /**
   * Marks all notifications as read
   */
  async markAllAsRead(): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post('/notifications/read-all'),
      () => ({ success: true }),
      'notifications/read-all'
    );
  },
};

export const getNotifications = notificationApi.getNotifications;
