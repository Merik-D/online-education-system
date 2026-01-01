import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const InstructorRoute = () => {
  const { isInstructor } = useAuth();
  if (!isInstructor()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
export default InstructorRoute;