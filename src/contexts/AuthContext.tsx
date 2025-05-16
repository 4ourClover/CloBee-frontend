// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../lib/axiosInstance';
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean | null;
  checkAuth: () => Promise<boolean>;
  setAuth: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  checkAuth: async () => false,
  setAuth: () => {}
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = async (): Promise<boolean> => {
    if (authChecked && isAuthenticated !== null) {
      return isAuthenticated;
    }

    try {
      await axiosInstance.get("/user/me");
      setIsAuthenticated(true);
      setAuthChecked(true);
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setIsAuthenticated(false);
      setAuthChecked(true);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const setAuth = (value: boolean) => {
    setIsAuthenticated(value);
    setAuthChecked(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};