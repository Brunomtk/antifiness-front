import type React from "react"
import PWARegister from "@/components/PWARegister"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/contexts/app-provider"
import { PageTransition } from "@/components/page-transition"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "Antifitness",
  description: "Antifitness app",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
    generator: 'v0.app'
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="application-name" content="Anti-Fitness" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Anti-Fitness" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#df0e67" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#df0e67" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.jpg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.jpg" />
        <link rel="shortcut icon" href="/icons/icon-72x72.jpg" />

        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        {/* Preload critical resources */}
        <link rel="preload" href="/logo-antifitness.png" as="image" />
        <link rel="preconnect" href="https://localhost:44394" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AppProvider>
            <PageTransition>{children}</PageTransition>
          </AppProvider>
        </ThemeProvider>
              <PWARegister />
      </body>
    </html>
  )
}
