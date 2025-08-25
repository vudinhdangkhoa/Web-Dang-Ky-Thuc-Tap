import axios from 'axios';
import Enum from './enum';

const apiConfig = new Enum();

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: apiConfig.getUrl(),
});

// Request interceptor - thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý refresh token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          apiConfig.getUrl('api/DangNhap/RefreshToken'),
          { refreshToken: refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Lưu token mới
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Refresh token thất bại, chuyển về trang đăng nhập
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        window.location.href = '/dang-nhap';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;