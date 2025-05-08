// utils/axiosInstance.ts
import axios from "axios"; // hoặc dùng process.env nếu bạn không có file config.ts
import { config } from "../../config";

const axiosInstance = axios.create({
  baseURL: config.BACKEND_API,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/Login";
        return Promise.reject(error);
      }

      try {
        const refreshUrl = `${config.BACKEND_API}/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`;

        const res = await axios.post(refreshUrl);

        const { newToken, refreshToken: newRefreshToken } = res.data.data;

        // Cập nhật token mới vào localStorage
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Retry request với token mới
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/Login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
