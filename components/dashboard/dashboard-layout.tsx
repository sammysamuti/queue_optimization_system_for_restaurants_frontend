"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChefHat,
  LayoutDashboard,
  Play,
  Building2,
  BarChart3,
  LogOut,
  LogIn,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { authService } from "@/lib/services/auth-service";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Simulations", href: "/dashboard/simulations", icon: Play },
  { name: "Restaurants", href: "/dashboard/restaurants", icon: Building2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

function PageTitle({ pathname }: { pathname: string }) {
  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/simulations": "Simulations",
    "/dashboard/restaurants": "Restaurants",
    "/dashboard/analytics": "Analytics",
  };

  // Find matching title
  for (const [path, title] of Object.entries(titles)) {
    if (
      pathname === path ||
      (path !== "/dashboard" && pathname.startsWith(path))
    ) {
      return <h1 className="text-lg font-semibold text-foreground">{title}</h1>;
    }
  }

  // Handle simulation detail pages
  if (pathname.startsWith("/dashboard/simulations/")) {
    if (pathname.includes("/new")) {
      return (
        <h1 className="text-lg font-semibold text-foreground">
          New Simulation
        </h1>
      );
    }
    // Try to get simulation ID from pathname
    const match = pathname.match(/\/dashboard\/simulations\/([^/]+)/);
    if (match) {
      const simId = match[1];
      return (
        <h1 className="text-lg font-semibold text-foreground">
          Simulation #{simId.slice(-6)}
        </h1>
      );
    }
    return (
      <h1 className="text-lg font-semibold text-foreground">
        Simulation Details
      </h1>
    );
  }

  // Handle restaurant detail pages
  if (pathname.startsWith("/dashboard/restaurants/")) {
    return (
      <h1 className="text-lg font-semibold text-foreground">
        Restaurant Details
      </h1>
    );
  }

  return null;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth and get user (optional - allow guest access)
    const fetchUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } else {
          setUser(null); // Guest mode
        }
      } catch {
        setUser(null); // Guest mode on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.refresh();
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const getInitials = (username: string | undefined): string => {
    if (!username) return "GU";
    const parts = username.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };
  const userInitials = getInitials(user?.username);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300",
          "bg-background border-border",
          sidebarCollapsed ? "w-20" : "w-64",
          "hidden lg:flex"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-foreground">
                QueueOpt
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform",
                sidebarCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            // Only highlight exact match for dashboard, allow sub-paths for others
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div
            className={cn(
              "flex items-center gap-3",
              sidebarCollapsed && "justify-center"
            )}
          >
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback className="bg-accent text-accent-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.username || "Guest Mode"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
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
                  className="w-full mt-3 justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full mt-3 justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
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
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-background border-r border-border transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">QueueOpt</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          {user ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
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
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Page Title */}
          <div className="flex-1 ml-4 lg:ml-0">
            <PageTitle pathname={pathname} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                {user ? (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user.username}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>Guest Mode</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Login to save results
                        </span>
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
  );
}
