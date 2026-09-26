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
        const token = localStorage.getItem('seait_stay_token');
        if (token) {
          api.setToken(token);
          const currentUser = await api.getMe();
          if (currentUser) {
            setUser(currentUser);
          }
        } else {
          // Default to student demo user for instant preview usability
          await switchDemoRole('student');
        }
      } catch (err) {
        console.warn('Could not restore session, falling back to student demo');
        await switchDemoRole('student');
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

  const switchDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      let email = 'kristine.bsit@seait.edu.ph';
      if (role === 'owner') email = 'nanay.rosa@gmail.com';
      if (role === 'admin') email = 'admin@seaitstay.edu.ph';

      const data = await api.login(email, 'Password123!');
      if (data?.user) {
        setUser(data.user);
      }
    } catch {
      // In case backend is offline, create fallback demo persona object
      const demoUsers: Record<UserRole, User> = {
        student: {
          id: 'user-student-1',
          email: 'kristine.bsit@seait.edu.ph',
          fullName: 'Kristine Joy Alcantara',
          role: 'student',
          phone: '+63 930 112 3456',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          studentId: 'SEAIT-2022-0491',
          department: 'College of Computer Studies (BSIT)',
          yearLevel: '3rd Year',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        owner: {
          id: 'user-owner-1',
          email: 'nanay.rosa@gmail.com',
          fullName: 'Rosa Mae Magbanua (Nanay Rosa)',
          role: 'owner',
          phone: '+63 928 412 8765',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        admin: {
          id: 'user-admin-1',
          email: 'admin@seaitstay.edu.ph',
          fullName: 'Engr. Danica Flores (Admin)',
          role: 'admin',
          phone: '+63 917 888 1234',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          department: 'SEAIT Student Affairs Office',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      setUser(demoUsers[role]);
    } finally {
      setIsLoading(false);
    }
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
