"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Mostrar prompt após 30 segundos se não estiver instalado
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, 30000)
    }

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      console.log("PWA: App instalado")
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("PWA: Escolha do usuário:", outcome)

    if (outcome === "accepted") {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Mostrar novamente em 24 horas
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  // Não mostrar se já está instalado ou não há prompt
  if (isInstalled || !deferredPrompt || !showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-80">
      <Card className="border-[#df0e67]/20 bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center border border-gray-800 shadow-xl">
                <span className="text-[#df0e67] font-bold text-sm drop-shadow-lg">AF</span>
              </div>
              <div>
                <CardTitle className="text-sm">Instalar App</CardTitle>
                <CardDescription className="text-xs">Adicione à tela inicial para acesso rápido</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-gray-600"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-[#df0e67] hover:bg-[#df0e67]/90 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar
            </Button>
            <Button variant="outline" onClick={handleDismiss} size="sm" className="border-gray-300 bg-transparent">
              Agora não
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
