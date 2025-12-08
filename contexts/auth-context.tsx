"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService, type User, type LoginRequest, type RegisterRequest } from "@/lib/services/auth-service"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        }
      } catch {
        authService.logout()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data)
    setUser(response.user)
    router.push("/dashboard")
  }

  const register = async (data: RegisterRequest) => {
    await authService.register(data)
    router.push("/login")
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
