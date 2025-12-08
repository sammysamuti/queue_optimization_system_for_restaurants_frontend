"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Loader2, Eye, EyeOff, Check } from "lucide-react"
import { authService } from "@/lib/services/auth-service"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.password2) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await authService.register(formData)
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: any) {
      const errorData = err.response?.data
      if (errorData) {
        const messages = Object.values(errorData).flat().join(", ")
        setError(messages || "Registration failed. Please try again.")
      } else {
        setError("Registration failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md rounded-2xl border-border">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Account Created!</h2>
              <p className="text-muted-foreground mt-2">Redirecting you to login...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md rounded-2xl border-border relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mx-auto">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">QueueOpt</span>
          </Link>
          <div>
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>Get started with queue optimization</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-xl pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password2">Confirm Password</Label>
              <Input
                id="password2"
                type="password"
                placeholder="Confirm your password"
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
