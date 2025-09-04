"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Status de conexão
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    setIsOnline(navigator.onLine)
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Service Worker registration
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)

        // Verificar atualizações
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
      window.location.reload()
    }
  }

  return (
    <div className="space-y-2">
      {/* Status de conexão */}
      <div className="flex items-center gap-2 text-xs">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-red-600 font-medium">Offline</span>
          </>
        )}
      </div>

      {/* Atualização disponível */}
      {updateAvailable && (
        <Button
          onClick={handleUpdate}
          size="sm"
          variant="outline"
          className="w-full h-8 text-xs border-[#df0e67] text-[#df0e67] hover:bg-[#df0e67]/10 bg-transparent"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Atualizar App
        </Button>
      )}
    </div>
  )
}
