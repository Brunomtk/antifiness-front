"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUserContext } from "@/contexts/user-context"
import {
  Utensils,
  Dumbbell,
  User,
  MessageSquare,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Video,
  FileText,
  Bell,
  Home,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { PWAStatus } from "@/components/pwa-status"
import { useUser } from "@/hooks/use-user"
import { useNotifications } from "@/hooks/use-notification"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ClientSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isMobile = useMobile()

  // Hooks para dados reais
  const { currentUser, logout, isLoading } = useUser()
  const { state, logout: ctxLogout } = useUserContext()
  const { unreadCount } = useNotifications()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Função de logout que redireciona para login
  const handleLogout = () => {
    console.log("🚪 === LOGOUT INICIADO ===")
    console.log("👤 Usuário atual:", currentUser?.name)

    // Limpar dados do usuário e token
    logout()
    ctxLogout()

    console.log("🧹 Token e dados limpos")
    console.log("🔄 Redirecionando para login...")

    // Redirecionar para a página de login
    router.replace("/login")

    console.log("✅ === LOGOUT CONCLUÍDO ===")
  }

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/client/dashboard",
      active: pathname === "/client/dashboard",
      shortLabel: "Início",
    },
    {
      label: "Plano Alimentar",
      icon: Utensils,
      href: "/client/diet",
      active: pathname === "/client/diet",
      shortLabel: "Dieta",
    },
    {
      label: "Treino",
      icon: Dumbbell,
      href: "/client/workout",
      active: pathname === "/client/workout",
      shortLabel: "Treino",
    },
    {
      label: "Conteúdos",
      icon: Video,
      href: "/client/courses",
      active: pathname === "/client/courses",
      shortLabel: "Cursos",
    },
    {
      label: "Mensagens",
      icon: MessageSquare,
      href: "/client/messages",
      active: pathname === "/client/messages",
      badge: 2, // TODO: Implementar contagem real de mensagens não lidas
      shortLabel: "Chat",
    },
    {
      label: "Feedbacks",
      icon: FileText,
      href: "/client/feedbacks",
      active: pathname === "/client/feedbacks",
      shortLabel: "Feedback",
    },
    {
      label: "Notificações",
      icon: Bell,
      href: "/client/notifications",
      active: pathname === "/client/notifications",
      badge: unreadCount || 0,
      shortLabel: "Avisos",
    },
    {
      label: "Perfil",
      icon: User,
      href: "/client/profile",
      active: pathname === "/client/profile",
      shortLabel: "Perfil",
    },
  ]

  // Função para gerar iniciais do nome
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Função para gerar avatar URL ou usar padrão
  const getAvatarUrl = (): string => {
    if (currentUser?.avatar && currentUser.avatar !== "string") {
      return currentUser.avatar
    }
    // Avatar padrão baseado no gênero ou genérico
    return "/diverse-woman-avatar.png" // Pode ser personalizado baseado em dados do usuário
  }

  if (!mounted) {
    return null
  }

  // Se ainda está carregando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-gradient-to-b from-white to-gray-50 md:flex md:flex-col animate-pulse">
        <div className="flex h-16 items-center border-b px-4">
          <div className="h-8 w-8 rounded-lg bg-gray-200"></div>
          <div className="ml-2 h-6 w-32 rounded bg-gray-200"></div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-200"></div>
          ))}
        </div>
      </div>
    )
  }

  // Se não há usuário logado, não mostrar sidebar
  if (!currentUser) {
    return null
  }

  return (
    <>
      {/* Mobile Menu Button - Posição otimizada */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="fixed right-4 top-4 z-50 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full bg-white shadow-lg border-[#df0e67]/20 hover:bg-[#df0e67]/5"
          >
            <Menu className="h-6 w-6 text-[#df0e67]" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 border-r bg-gradient-to-b from-white to-gray-50 p-0">
          <nav className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/client/dashboard" className="flex items-center gap-2 font-semibold text-black">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center border border-gray-800 shadow-xl">
                  <span className="text-[#df0e67] font-bold text-sm drop-shadow-lg">AF</span>
                </div>
                <span className="text-xl">Anti-Fitness</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid items-start px-2 text-sm font-medium">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-4 transition-all duration-200 ease-in-out",
                      route.active
                        ? "bg-gradient-to-r from-[#df0e67]/10 to-black/5 text-[#df0e67] font-medium border-l-4 border-[#df0e67]"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-[#df0e67]/5 hover:to-black/5 hover:text-[#df0e67]",
                    )}
                  >
                    <route.icon
                      className={cn(
                        "h-6 w-6 transition-colors",
                        route.active ? "text-[#df0e67]" : "text-gray-500 group-hover:text-[#df0e67]",
                      )}
                    />
                    <span className="flex-1 text-base">{route.label}</span>
                    {route.badge && route.badge > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#df0e67] px-2 text-xs font-medium text-white">
                        {route.badge > 9 ? "9+" : route.badge}
                      </span>
                    )}
                    {route.active && <ChevronRight className="h-5 w-5 text-[#df0e67]" />}
                  </Link>
                ))}
              </nav>
            </div>

            {/* PWA Status na sidebar mobile */}
            <div className="border-t p-4">
              <PWAStatus />
            </div>

            {/* Perfil do usuário na sidebar mobile */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={getAvatarUrl() || "/placeholder.svg"} alt={currentUser.name} />
                  <AvatarFallback className="bg-[#df0e67] text-white">{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  {currentUser.clientId && (
                    <p className="text-xs text-[#df0e67] font-medium">ID: {currentUser.clientId}</p>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sair</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-gradient-to-b from-white to-gray-50 md:flex md:flex-col",
          className,
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/client/dashboard" className="flex items-center gap-2 font-semibold text-black">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center border border-gray-800 shadow-xl">
              <span className="text-[#df0e67] font-bold text-sm drop-shadow-lg">AF</span>
            </div>
            <span className="text-xl">Anti-Fitness</span>
          </Link>
          <Badge variant="outline" className="ml-auto border-[#df0e67] text-[#df0e67] text-xs">
            Cliente
          </Badge>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 ease-in-out",
                  route.active
                    ? "bg-gradient-to-r from-[#df0e67]/10 to-black/5 text-[#df0e67] font-medium border-l-4 border-[#df0e67]"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-[#df0e67]/5 hover:to-black/5 hover:text-[#df0e67]",
                )}
              >
                <route.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    route.active ? "text-[#df0e67]" : "text-gray-500 group-hover:text-[#df0e67]",
                  )}
                />
                <span className="flex-1">{route.label}</span>
                {route.badge && route.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#df0e67] px-1.5 text-xs font-medium text-white">
                    {route.badge > 9 ? "9+" : route.badge}
                  </span>
                )}
                {route.active && <ChevronRight className="h-4 w-4 text-[#df0e67]" />}
              </Link>
            ))}
          </nav>
        </div>

        {/* PWA Status na sidebar desktop */}
        <div className="border-t p-4">
          <PWAStatus />
        </div>

        {/* Perfil do usuário na sidebar desktop */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getAvatarUrl() || "/placeholder.svg"} alt={currentUser.name} />
              <AvatarFallback className="bg-[#df0e67] text-white">{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              {currentUser.clientId && <p className="text-xs text-[#df0e67] font-medium">ID: {currentUser.clientId}</p>}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sair</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation - Otimizado */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-around px-1 py-2">
            {routes.slice(0, 5).map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex flex-col items-center py-2 px-2 transition-all duration-200 rounded-xl min-w-0 flex-1",
                  route.active
                    ? "text-[#df0e67] bg-gradient-to-t from-[#df0e67]/10 to-black/5 scale-105"
                    : "text-gray-500 hover:text-[#df0e67] hover:bg-gray-50",
                )}
              >
                <div className="relative">
                  <route.icon
                    className={cn("h-6 w-6 transition-colors", route.active ? "text-[#df0e67]" : "text-gray-500")}
                  />
                  {route.badge && route.badge > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#df0e67] text-[10px] font-bold text-white border-2 border-white">
                      {route.badge > 9 ? "9+" : route.badge}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 text-[10px] font-medium truncate w-full text-center",
                    route.active ? "text-[#df0e67]" : "text-gray-500",
                  )}
                >
                  {route.shortLabel}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
