'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, LoginCredentials, AuthContextType, UserData } from '../types';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });
      if (!res.ok) {
        console.error(
          `Response status: ${res.status}\n. Response Msg: ${await res.text}`
        );
        throw new Error(
          `Response status: ${res.status}\n. Response Msg: ${await res.text}`
        );
      }

      let user_details: UserData = await res.json();
      console.log(user_details);
      if (!user_details) {
        alert('User does not exist');
        return;
      }
      if (
        !(
          user_details.role.roleType === 'EBOARD' ||
          user_details.role.roleType === 'MEMBER'
        )
      ) {
        alert('Incorrect Roles');
        return;
      }
      if (credentials.password !== user_details.password) {
        alert('Invalid email or password');
        return;
      }

      // Mock user data based on email
      const user: User = {
        id: user_details.userId,
        email: credentials.email,
        name: user_details.firstName + ' ' + user_details.lastName,
        role: user_details.role.roleType,
        avatar: undefined
      };

      setUser(user);
      console.log(user);
      router.push('/homepage');
    } catch (error) {
      alert(`Login failed: ${error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
