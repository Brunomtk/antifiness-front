import type React from "react"
import type { Metadata, Viewport } from "next"
import { ClientSidebar } from "@/components/client-sidebar"
import { NotificationProvider } from "@/components/notification-provider"
import { PWAInstall } from "@/components/pwa-install"

export const metadata: Metadata = {
  title: "Anti-Fitness Cliente",
  description: "Aplicativo do cliente Anti-Fitness para acompanhamento nutricional",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Anti-Fitness Cliente",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b0b0b",
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <div className="min-h-screen flex">
        <ClientSidebar />
        <div className="flex-1">
          {children}
          <PWAInstall />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registrado:', registration.scope);
                      })
                      .catch(function(err) {
                        console.log('Falha no SW:', err);
                      });
                  });
                }
              `,
            }}
          />
        </div>
      </div>
    </NotificationProvider>
  )
}
