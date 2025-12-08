import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/contexts/theme-context"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "QueueOpt - Restaurant Queue Optimization",
  description: "Optimize your restaurant queue management with powerful simulation modeling and analytics",
  keywords: ["queue optimization", "restaurant", "simulation", "analytics", "modeling"],
}

export const viewport: Viewport = {
  themeColor: "#e85d3b",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
