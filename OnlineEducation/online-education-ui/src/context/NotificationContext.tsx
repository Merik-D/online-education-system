import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}
interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, message, type };
    setNotifications((prev) => [...prev, notification]);
    const timeout = type === 'error' ? 7000 : 5000;
    setTimeout(() => {
      removeNotification(id);
    }, timeout);
    return id;
  }, []);
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  const value: NotificationContextType = {
    notifications,
    showNotification,
    removeNotification,
    clearAll,
  };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};