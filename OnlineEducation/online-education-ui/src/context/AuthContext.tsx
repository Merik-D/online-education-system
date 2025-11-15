import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthResponseDto } from '../models/auth.models';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  auth: AuthResponseDto | null;
  login: (data: AuthResponseDto) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthResponseDto | null>(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        jwtDecode(token);
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });

  const login = (data: AuthResponseDto) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
  };

  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const decoded: { exp: number } = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};