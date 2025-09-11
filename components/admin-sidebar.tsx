"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  BarChart3,
  User,
  BookOpen,
  Dumbbell,
  UtensilsCrossed,
  X,
  LogOut,
  Bell,
  UserCog,
} from "lucide-react"
import { useUserContext } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/admin/clients", icon: Users },
  { name: "Usuários", href: "/admin/users", icon: UserCog }, // Added users management menu item
  { name: "Planos", href: "/admin/plans", icon: Calendar },
  { name: "Dietas", href: "/admin/diets", icon: UtensilsCrossed },
  { name: "Treinos", href: "/admin/workouts", icon: Dumbbell },
  { name: "Cursos", href: "/admin/courses", icon: BookOpen },
  { name: "Mensagens", href: "/admin/messages", icon: MessageSquare, badge: 3 },
  { name: "Notificações", href: "/admin/notifications", icon: Bell }, // Added notifications menu item
  { name: "Feedbacks", href: "/admin/feedbacks", icon: FileText },
  { name: "Relatórios", href: "/admin/reports", icon: BarChart3 },
  { name: "Perfil", href: "/admin/profile", icon: User },
]

interface AdminSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const { state, logout } = useUserContext()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getUserRoleLabel = (role: string) => {
    return role === "admin" ? "Nutricionista" : "Cliente"
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
            <div className="flex h-16 flex-shrink-0 items-center justify-between px-4">
              <Image src="/logo-antifitness.png" alt="Anti-Fitness" width={40} height={40} className="rounded-lg" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <SidebarContent
              navigation={navigation}
              pathname={pathname}
              currentUser={state.currentUser}
              getUserRoleLabel={getUserRoleLabel}
              getUserInitials={getUserInitials}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 flex-shrink-0 items-center px-4">
            <Image src="/logo-antifitness.png" alt="Anti-Fitness" width={40} height={40} className="rounded-lg" />
            <span className="ml-3 text-xl font-bold text-gray-900">Anti-Fitness</span>
          </div>
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            currentUser={state.currentUser}
            getUserRoleLabel={getUserRoleLabel}
            getUserInitials={getUserInitials}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </>
  )
}

interface SidebarContentProps {
  navigation: typeof navigation
  pathname: string
  currentUser: any
  getUserRoleLabel: (role: string) => string
  getUserInitials: (name: string) => string
  onLogout: () => void
}

function SidebarContent({
  navigation,
  pathname,
  currentUser,
  getUserRoleLabel,
  getUserInitials,
  onLogout,
}: SidebarContentProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* User info */}
      <div className="flex flex-col items-center px-4 py-6 border-b border-gray-200">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name || "Usuário"} />
          <AvatarFallback className="bg-gradient-to-r from-black to-gray-800 text-white text-lg">
            {currentUser?.name ? getUserInitials(currentUser.name) : "U"}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-sm font-medium text-gray-900 text-center">{currentUser?.name || "Usuário"}</h3>
        <p className="text-xs text-gray-500 text-center">{currentUser?.email}</p>
        <Badge variant="secondary" className="mt-2 text-xs">
          {currentUser?.role ? getUserRoleLabel(currentUser.role) : ""}
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500",
                )}
              />
              {item.name}
              {item.badge && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout button */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )
}
