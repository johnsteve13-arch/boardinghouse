'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@seait-stay/types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User | undefined>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('seait_stay_token') : null;
        if (token) {
          api.setToken(token);
          const currentUser = await api.getMe();
          if (currentUser) {
            setUser(currentUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, pass: string): Promise<User | undefined> => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      if (data?.user) {
        setUser(data.user);
        return data.user;
      }
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(formData);
      if (data?.user) {
        setUser(data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const switchDemoRole = async (_role: UserRole) => {
    // Stub retained for interface compatibility
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
