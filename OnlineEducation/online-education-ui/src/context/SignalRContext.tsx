import React, { createContext, useCallback, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useApi } from '../hooks/useApi';
interface SignalRNotification {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}
interface TestGradedNotification extends SignalRNotification {
  testId: number;
  score: number;
  maxScore: number;
  percentage: number;
}
interface CourseAnnouncementNotification extends SignalRNotification {
  courseId: number;
  instructorName: string;
}
interface SignalRContextType {
  isConnected: boolean;
  connection: signalR.HubConnection | null;
  joinCourseGroup: (courseId: number) => Promise<void>;
  leaveCourseGroup: (courseId: number) => Promise<void>;
  joinTestGroup: (testId: number) => Promise<void>;
  leaveTestGroup: (testId: number) => Promise<void>;
  sendPrivateMessage: (userId: string, message: string) => Promise<void>;
  onNotification: (callback: (notification: SignalRNotification) => void) => void;
  onTestGraded: (callback: (notification: TestGradedNotification) => void) => void;
  onCourseAnnouncement: (callback: (notification: CourseAnnouncementNotification) => void) => void;
  onEnrollmentConfirmed: (callback: (notification: SignalRNotification) => void) => void;
  onNewMaterialAvailable: (callback: (notification: SignalRNotification) => void) => void;
}
export const SignalRContext = createContext<SignalRContextType | null>(null);
interface SignalRProviderProps {
  children: React.ReactNode;
}
export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationHandlers, setNotificationHandlers] = useState<
    Map<string, Set<Function>>
  >(new Map());
  const token = localStorage.getItem('token');
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://localhost:7256';
  useEffect(() => {
    if (!token) return;
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/hubs/notifications`, {
        accessTokenFactory: () => token,
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();
    newConnection.on('ReceiveNotification', (notification: SignalRNotification) => {
      const handlers = notificationHandlers.get('notification');
      if (handlers) {
        handlers.forEach((handler) => handler(notification));
      }
    });
    newConnection.on('TestGraded', (notification: TestGradedNotification) => {
      const handlers = notificationHandlers.get('testGraded');
      if (handlers) {
        handlers.forEach((handler) => handler(notification));
      }
    });
    newConnection.on('CourseAnnouncement', (notification: CourseAnnouncementNotification) => {
      const handlers = notificationHandlers.get('courseAnnouncement');
      if (handlers) {
        handlers.forEach((handler) => handler(notification));
      }
    });
    newConnection.on('EnrollmentConfirmed', (notification: SignalRNotification) => {
      const handlers = notificationHandlers.get('enrollmentConfirmed');
      if (handlers) {
        handlers.forEach((handler) => handler(notification));
      }
    });
    newConnection.on('NewMaterialAvailable', (notification: SignalRNotification) => {
      const handlers = notificationHandlers.get('newMaterialAvailable');
      if (handlers) {
        handlers.forEach((handler) => handler(notification));
      }
    });
    newConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      setIsConnected(true);
    });
    newConnection.onreconnecting((error?: Error) => {
      console.warn('SignalR reconnecting:', error);
      setIsConnected(false);
    });
    newConnection.onclose((error?: Error) => {
      console.error('SignalR connection closed:', error);
      setIsConnected(false);
    });
    newConnection
      .start()
      .then(() => {
        console.log('SignalR connected');
        setIsConnected(true);
      })
      .catch((error: Error) => {
        console.error('SignalR connection failed:', error);
        setIsConnected(false);
      });
    setConnection(newConnection);
    return () => {
      if (newConnection) {
        newConnection.stop().catch((error: Error) => console.error('Error stopping SignalR:', error));
      }
    };
  }, [token, apiBaseUrl, notificationHandlers]);
  const registerHandler = useCallback(
    (eventName: string, handler: Function) => {
      const newHandlers = new Map(notificationHandlers);
      if (!newHandlers.has(eventName)) {
        newHandlers.set(eventName, new Set());
      }
      newHandlers.get(eventName)?.add(handler);
      setNotificationHandlers(newHandlers);
    },
    [notificationHandlers]
  );
  const joinCourseGroup = useCallback(
    async (courseId: number) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('JoinCourseGroup', courseId);
      }
    },
    [connection]
  );
  const leaveCourseGroup = useCallback(
    async (courseId: number) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('LeaveCourseGroup', courseId);
      }
    },
    [connection]
  );
  const joinTestGroup = useCallback(
    async (testId: number) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('JoinTestGroup', testId);
      }
    },
    [connection]
  );
  const leaveTestGroup = useCallback(
    async (testId: number) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('LeaveTestGroup', testId);
      }
    },
    [connection]
  );
  const sendPrivateMessage = useCallback(
    async (userId: string, message: string) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('SendPrivateMessage', userId, message);
      }
    },
    [connection]
  );
  const value: SignalRContextType = {
    isConnected,
    connection,
    joinCourseGroup,
    leaveCourseGroup,
    joinTestGroup,
    leaveTestGroup,
    sendPrivateMessage,
    onNotification: (callback) => registerHandler('notification', callback),
    onTestGraded: (callback) => registerHandler('testGraded', callback),
    onCourseAnnouncement: (callback) => registerHandler('courseAnnouncement', callback),
    onEnrollmentConfirmed: (callback) => registerHandler('enrollmentConfirmed', callback),
    onNewMaterialAvailable: (callback) => registerHandler('newMaterialAvailable', callback),
  };
  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
};