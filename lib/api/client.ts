import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

// Get API URL from environment variable
let BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4400/api";

// Normalize the URL - ensure it uses HTTP if it's an IP address (for development)
// This helps avoid SSL certificate issues with self-signed certs
if (typeof window !== "undefined") {
  const isProduction = window.location.protocol === "https:";
  const urlObj = new URL(BASE_URL);

  // If frontend is HTTPS but backend URL is HTTP with IP address, warn about mixed content
  if (
    isProduction &&
    urlObj.protocol === "http:" &&
    /^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)
  ) {
    console.warn(
      "⚠️ Mixed Content Warning: HTTPS frontend cannot connect to HTTP backend with IP address."
    );
    console.warn(
      "   Consider using HTTPS with valid certificate or a domain name with proper CORS setup."
    );
  }
}

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
  // For development: allow self-signed certificates (NOT recommended for production)
  // This is only needed if backend uses HTTPS with self-signed cert
  ...(process.env.NODE_ENV === "development" &&
    BASE_URL.startsWith("https://") && {
      httpsAgent: typeof window === "undefined" ? undefined : undefined, // Node.js only
    }),
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
        // Clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
