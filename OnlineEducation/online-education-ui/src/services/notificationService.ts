import { Notification } from '../models/notification.models';
import api from './api';
export const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>('/notifications');
  return response.data;
};
export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.post('/notifications/mark-all-read');
};