import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/contexts/app-provider"
import { PageTransition } from "@/components/page-transition"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Nutrição - Anti-Fitness",
  description: "Sistema completo de gestão nutricional",
  icons: {
    icon: "/logo-antifitness.png",
    shortcut: "/logo-antifitness.png",
    apple: "/logo-antifitness.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AppProvider>
            <PageTransition>{children}</PageTransition>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
