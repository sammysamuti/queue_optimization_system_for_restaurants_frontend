import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Log API URL for debugging
if (typeof window !== "undefined") {
  console.log("🔗 Frontend API Configuration:");
  console.log("   API Base URL:", BASE_URL);
  console.log("   Frontend Origin:", window.location.origin);
  console.log("   Full Login Endpoint:", `${BASE_URL}/auth/login/`);
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem("accessToken", access);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens but don't redirect to login (allow guest mode)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Don't redirect - let the app handle guest mode gracefully
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
