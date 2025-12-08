"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService, type User, type LoginRequest, type RegisterRequest } from "@/lib/services/auth-service"

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data)
    setUser(response.user)
    setIsAuthenticated(true)
    router.push("/dashboard")
    return response
  }

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data)
    return response
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refetch: fetchUser,
  }
}
