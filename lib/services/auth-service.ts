import apiClient from "@/lib/api/client"

// Types
export interface RegisterRequest {
  username: string
  email: string
  password: string
  password2: string
}

export interface RegisterResponse {
  id: number
  username: string
  email: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  refresh: string
  access: string
  user: {
    id: number
    username: string
    email: string
  }
}

export interface User {
  id: number
  username: string
  email: string
}

class AuthService {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>("/auth/register/", data)
    return response.data
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login/", data)
      // Store tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", response.data.access)
        localStorage.setItem("refreshToken", response.data.refresh)
      }
      return response.data
    } catch (error: any) {
      // Better error handling
      if (error.code === "ECONNREFUSED" || error.message?.includes("Network Error")) {
        throw new Error("Cannot connect to backend server. Please check if the server is running.")
      }
      if (error.response?.status === 401) {
        throw new Error("Invalid username or password.")
      }
      if (error.response?.status === 404) {
        throw new Error("Backend endpoint not found. Please check API URL configuration.")
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      }
      throw new Error(error.message || "Login failed. Please try again.")
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await apiClient.post<{ access: string }>("/auth/token/refresh/", {
      refresh: refreshToken,
    })
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me/")
    return response.data
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
  }

  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("accessToken")
    }
    return false
  }

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken")
    }
    return null
  }
}

export const authService = new AuthService()
