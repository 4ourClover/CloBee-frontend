// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios/axiosInstance';
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean | null;
  checkAuth: () => Promise<boolean>;
  setAuth: (value: boolean) => void;
    userId: number | null;
  /** userId 설정 함수 */
  setUserId: (id: number) => void;
}


export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  checkAuth: async () => false,
  setAuth: () => {},
    userId: null,
  setUserId: () => {}
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    if (authChecked && isAuthenticated === true && userId !== null) {
      return isAuthenticated;
    }

    try {
interface MeResponse { userId: number; /* 필요하면 추가 필드 */ }
      const response = await axiosInstance.get<MeResponse>("/user/me");
      const fetchedId = response.data.userId;
      setIsAuthenticated(true);
      setUserId(fetchedId);
      setAuthChecked(true);
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setIsAuthenticated(false);
      setAuthChecked(true);
      setUserId(null);
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
    <AuthContext.Provider       
    value={{
        isAuthenticated,
        checkAuth,
        setAuth,
        userId,
        setUserId
      }}>
      {children}
    </AuthContext.Provider>
  );
};