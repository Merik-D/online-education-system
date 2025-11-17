import { Notification } from '../models/notification.models';
import api from './api';

// Отримуємо *тільки* непрочитані сповіщення
export const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>('/notifications');
  return response.data;
};

// Позначаємо сповіщення як прочитане
export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.post('/notifications/mark-all-read');
};