'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';

interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for existing token on mount
    const token = localStorage.getItem('gh_access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('gh_access_token', token);
    setAccessToken(token);
  };

  const logout = () => {
    localStorage.removeItem('gh_access_token');
    setAccessToken(null);
    navigate('/login');
  };

  const contextValue: AuthContextType = {
    accessToken,
    isAuthenticated: !!accessToken,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
