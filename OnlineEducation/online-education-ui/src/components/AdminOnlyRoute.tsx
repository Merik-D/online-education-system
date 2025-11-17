import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminOnlyRoute = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
export default AdminOnlyRoute;