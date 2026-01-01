export interface Notification {
  id: number;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}