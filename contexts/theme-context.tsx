"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) {
      setThemeState(stored)
      document.documentElement.classList.toggle("dark", stored === "dark")
    } else {
      // Default to dark
      document.documentElement.classList.add("dark")
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
