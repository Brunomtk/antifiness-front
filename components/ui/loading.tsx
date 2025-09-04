"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  variant?: "default" | "minimal" | "pulse" | "spin"
  className?: string
}

export function Loading({ size = "md", text, variant = "default", className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {/* Logo com animações */}
      <div className="relative">
        {/* Círculos animados de fundo */}
        <div className={cn("relative", sizeClasses[size])}>
          {/* Círculo externo - preto */}
          <div className="absolute inset-0 rounded-full border-4 border-black/30 animate-spin [animation-duration:3s]"></div>

          {/* Círculo do meio - primary */}
          <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-spin [animation-duration:2s] [animation-direction:reverse]"></div>

          {/* Círculo interno - preto */}
          <div className="absolute inset-4 rounded-full border-4 border-black/60 animate-spin [animation-duration:1.5s]"></div>

          {/* Fundo preto atrás da logo */}
          <div className="absolute inset-6 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black rounded-full shadow-2xl border-2 border-gray-800">
            <img
              src="/logo-antifitness.png"
              alt="Anti-Fitness Logo"
              className="w-full h-full object-contain animate-pulse [animation-duration:2s] p-2"
            />
          </div>

          {/* Pontos orbitais - pretos e primary */}
          {variant === "default" && (
            <>
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-black rounded-full animate-spin [animation-duration:2s] origin-[0_50px]"></div>
              <div className="absolute top-1/2 right-0 w-2 h-2 bg-primary rounded-full animate-spin [animation-duration:2.5s] origin-[-50px_0] [animation-direction:reverse]"></div>
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-black rounded-full animate-spin [animation-duration:3s] origin-[0_-50px]"></div>
            </>
          )}
        </div>

        {/* Efeito de pulso - preto */}
        {variant === "pulse" && (
          <div className={cn("absolute inset-0 rounded-full bg-black/20 animate-ping", sizeClasses[size])}></div>
        )}
      </div>

      {/* Texto */}
      {text && (
        <div className="text-center space-y-1">
          <p className={cn("font-medium text-foreground animate-pulse", textSizes[size])}>{text}</p>
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:300ms]"></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componentes especializados
export function PageLoading({ text = "Carregando...", className }: { text?: string; className?: string }) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5",
        className,
      )}
    >
      <Loading size="lg" text={text} variant="default" />
    </div>
  )
}

export function SectionLoading({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <Loading size="md" text={text} variant="default" />
    </div>
  )
}

export function InlineLoading({ className }: { className?: string }) {
  return <Loading size="sm" variant="minimal" className={className} />
}

export function ButtonLoading({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
}
