import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import { Notification } from '../models/notification.models';
import { IconButton, Badge, Menu, MenuItem, Typography, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
const NotificationsMenu = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  useEffect(() => {
    if (auth) {
      fetchNotifications();
    }
  }, [auth]);
  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleNotificationClick = async (notification: Notification) => {
    handleClose();
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    try {
      await markNotificationAsRead(notification.id);
      if (notification.linkUrl) {
        navigate(notification.linkUrl);
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };
  const handleMarkAllClick = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };
  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleMenuOpen}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {}
        {notifications.length > 0 && unreadCount > 0 && (
          <MenuItem
            onClick={handleMarkAllClick}
            sx={{ fontStyle: 'italic', color: 'blue' }}
          >
            Позначити всі як прочитані
          </MenuItem>
        )}
        {notifications.length > 0 && unreadCount > 0 && <Divider />}
        {notifications.length === 0 ? (
          <MenuItem onClick={handleClose}>Немає сповіщень</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                fontWeight: notification.isRead ? 'normal' : 'bold',
                color: notification.isRead ? 'text.secondary' : 'text.primary',
                whiteSpace: 'normal'
              }}
            >
              {notification.message}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};
export default NotificationsMenu;