import type React from "react"
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
  title: "Anti-Fitness - Sistema de Nutrição",
  description: "Sistema completo de gestão nutricional com acompanhamento personalizado para uma vida mais saudável",
  keywords: ["nutrição", "dieta", "saúde", "fitness", "acompanhamento nutricional", "anti-fitness"],
  authors: [{ name: "Anti-Fitness Team" }],
  creator: "Anti-Fitness",
  publisher: "Anti-Fitness",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Anti-Fitness",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://antifitness.com",
    siteName: "Anti-Fitness",
    title: "Anti-Fitness - Sistema de Nutrição",
    description: "Sistema completo de gestão nutricional com acompanhamento personalizado",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anti-Fitness - Sistema de Nutrição",
    description: "Sistema completo de gestão nutricional com acompanhamento personalizado",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="application-name" content="Anti-Fitness" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Anti-Fitness" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#df0e67" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#df0e67" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.jpg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.jpg" />

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
      </body>
    </html>
  )
}
