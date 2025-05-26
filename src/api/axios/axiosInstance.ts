import axios from 'axios';
import api from '../../api/axios/index';
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedToken = Cookies.get("refreshToken");

      try {
        const { data } = await api.post<TokenResponse>(`/user/refresh`, {
          refreshToken: storedToken,
        });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        Cookies.set("accessToken", newAccessToken);
        Cookies.set("refreshToken", newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
