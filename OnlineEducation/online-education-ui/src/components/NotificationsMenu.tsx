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

  // Рахуємо тільки непрочитані
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
    // Клік на дзвіночок більше не позначає все як прочитане
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // --- НОВА ФУНКЦІЯ: Клік на ОДНЕ сповіщення ---
  const handleNotificationClick = async (notification: Notification) => {
    handleClose();
    
    // 1. Позначаємо як прочитане локально (для миттєвого UI)
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    
    // 2. Відправляємо запит на бекенд
    try {
      await markNotificationAsRead(notification.id);
      
      // 3. Переходимо за посиланням, ЯКЩО ВОНО Є
      if (notification.linkUrl) {
        navigate(notification.linkUrl);
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  // --- НОВА ФУНКЦІЯ: Клік на "Позначити всі" ---
  const handleMarkAllClick = async () => {
    // Не закриваємо меню, просто оновлюємо
    
    // 1. Позначаємо всі як прочитані локально
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
    
    // 2. Відправляємо запит на бекенд
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
        onClick={handleMenuOpen} // <-- Тепер тут просто 'handleMenuOpen'
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
        {/* --- ДОДАЄМО КНОПКУ "ПОЗНАЧИТИ ВСІ" --- */}
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
              onClick={() => handleNotificationClick(notification)} // <-- Тепер клік тут
              sx={{
                fontWeight: notification.isRead ? 'normal' : 'bold',
                color: notification.isRead ? 'text.secondary' : 'text.primary',
                whiteSpace: 'normal' // Дозволяє перенос тексту
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