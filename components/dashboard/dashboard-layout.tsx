"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChefHat,
  LayoutDashboard,
  Play,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  LogIn,
  Search,
  Bell,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
  User,
} from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { authService } from "@/lib/services/auth-service"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Simulations", href: "/dashboard/simulations", icon: Play },
  { name: "Restaurants", href: "/dashboard/restaurants", icon: Building2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check auth and get user (optional - allow guest access)
    const fetchUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } else {
          setUser(null) // Guest mode
        }
      } catch {
        setUser(null) // Guest mode on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    router.refresh()
  }

  const handleLogin = () => {
    router.push("/login")
  }

  const userInitials = user?.username?.slice(0, 2).toUpperCase() || "GU"

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64",
          "hidden lg:flex",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            {!sidebarCollapsed && <span className="text-lg font-bold text-sidebar-foreground">QueueOpt</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src="/diverse-avatars.png" />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.username || "Guest Mode"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email || "Login to save results"}
                </p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <>
              {user ? (
                <Button
                  variant="ghost"
                  className="w-full mt-3 justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full mt-3 justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={handleLogin}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">QueueOpt</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          {user ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleLogin}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn("flex-1 flex flex-col transition-all duration-300", sidebarCollapsed ? "lg:ml-20" : "lg:ml-64")}
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 bg-secondary border-0 rounded-xl" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src="/diverse-avatars.png" />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                {user ? (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user.username}</span>
                        <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>Guest Mode</span>
                        <span className="text-xs font-normal text-muted-foreground">Login to save results</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogin}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
