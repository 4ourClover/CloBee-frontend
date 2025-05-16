import axios from "axios";
import Cookies from "js-cookie";

const baseURL = "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
        const { data } = await axios.post<TokenResponse>(`${baseURL}/user/refresh`, {
          refreshToken: storedToken,
        });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        Cookies.set("accessToken", newAccessToken);
        Cookies.set("refreshToken", newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("토큰 갱신 실패:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
