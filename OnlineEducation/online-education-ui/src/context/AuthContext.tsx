import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthResponseDto } from '../models/auth.models';
import { jwtDecode } from 'jwt-decode';
interface DecodedToken {
  exp: number;
  [key: string]: any;
}
interface AuthState {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
  id: number;
}
interface AuthContextType {
  auth: AuthState | null;
  login: (data: AuthResponseDto) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
  isInstructor: () => boolean;
  isStudent: () => boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const parseToken = (token: string, userData: string): AuthState | null => {
   try {
      const decoded: DecodedToken = jwtDecode(token);
      const user: AuthResponseDto = JSON.parse(userData);
      let roles: string[] = [];
      const roleData = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const nameId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ?? decoded['nameid']
        ?? decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameid']
        ?? decoded['http://schemas.microsoft.com/identity/claims/objectidentifier'];
      const id = parseInt(nameId, 10) || 0;
      if (typeof roleData === 'string') {
        roles = [roleData];
      } else if (Array.isArray(roleData)) {
        roles = roleData;
      }
      return { token, email: user.email, fullName: user.fullName, roles, id };
    } catch (error) {
      console.error("Failed to parse token:", error);
      return null;
    }
};
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const authState = parseToken(token, userData);
      if (authState) {
         const decoded: { exp: number } = jwtDecode(authState.token);
         if (decoded.exp * 1000 > Date.now()) {
            return authState;
         }
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  });
  const login = (data: AuthResponseDto) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setAuth(parseToken(data.token, JSON.stringify(data)));
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
  };
  const isLoggedIn = () => !!auth;
  const isAdmin = () => {
    if (!auth) return false;
    return auth.roles.includes('Admin');
  };
  const isInstructor = () => {
    if (!auth) return false;
    return auth.roles.includes('Instructor');
  };
  const isStudent = () => {
    if (!auth) return false;
    return auth.roles.includes('Student');
  };
  return (
    <AuthContext.Provider value={{ auth, login, logout, isLoggedIn, isAdmin, isInstructor, isStudent }}>
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