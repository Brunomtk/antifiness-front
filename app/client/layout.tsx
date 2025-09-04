import type React from "react"
import { ClientSidebar } from "@/components/client-sidebar"
import { NotificationProvider } from "@/components/notification-provider"
import { PWAInstall } from "@/components/pwa-install"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Anti-Fitness Cliente",
  description: "Aplicativo do cliente Anti-Fitness para acompanhamento nutricional",
  manifest: "/client-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Anti-Fitness Cliente",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#df0e67",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-50">
        <ClientSidebar />
        <main className="flex-1 md:ml-64 pb-16 md:pb-0">{children}</main>
        <PWAInstall />

        {/* Scripts PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/client-sw.js')
                    .then(function(registration) {
                      console.log('SW registrado com sucesso:', registration.scope);
                    }, function(err) {
                      console.log('Falha no registro do SW:', err);
                    });
                });
              }
            `,
          }}
        />
      </div>
    </NotificationProvider>
  )
}
