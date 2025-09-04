"use client"

import { useEffect, useState } from "react"
import { Loading } from "@/components/ui/loading"

interface LoadingScreenProps {
  isLoading: boolean
  text?: string
  minDuration?: number
}

export function LoadingScreen({
  isLoading,
  text = "Preparando sua experiência...",
  minDuration = 1000,
}: LoadingScreenProps) {
  const [showLoading, setShowLoading] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
    } else {
      // Garante duração mínima para evitar flicker
      const timer = setTimeout(() => {
        setShowLoading(false)
      }, minDuration)

      return () => clearTimeout(timer)
    }
  }, [isLoading, minDuration])

  if (!showLoading) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-white to-black/5 z-50 flex items-center justify-center">
      {/* Padrão de fundo animado - preto e primary */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-black rounded-full animate-pulse [animation-delay:0s] [animation-duration:3s]"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-primary rounded-full animate-pulse [animation-delay:1s] [animation-duration:3s]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-black rounded-full animate-pulse [animation-delay:2s] [animation-duration:3s]"></div>
      </div>

      {/* Loading principal */}
      <div className="relative z-10">
        <Loading size="xl" text={text} variant="default" className="animate-fade-in" />
      </div>

      {/* Texto adicional */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-500 text-sm animate-pulse">Sistema de Nutrição Profissional</p>
      </div>
    </div>
  )
}
