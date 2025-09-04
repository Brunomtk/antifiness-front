"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, MessageCircle, Calendar, UserPlus, TrendingUp, X } from "lucide-react"
import Link from "next/link"

// Dados simulados das notificações
const notifications = [
  {
    id: 1,
    type: "message",
    title: "Nova mensagem",
    description: "Ana Silva enviou uma mensagem",
    time: "2 min atrás",
    read: false,
    avatar: "/diverse-woman-avatar.png",
    initials: "AS",
    link: "/admin/messages",
  },
  {
    id: 2,
    type: "client",
    title: "Novo cliente",
    description: "Carlos Oliveira se cadastrou na plataforma",
    time: "15 min atrás",
    read: false,
    avatar: "/man-avatar.png",
    initials: "CO",
    link: "/admin/clients",
  },
  {
    id: 3,
    type: "appointment",
    title: "Consulta agendada",
    description: "Mariana Santos agendou consulta para amanhã às 14h",
    time: "1 hora atrás",
    read: true,
    avatar: "/female-client-avatar.png",
    initials: "MS",
    link: "/admin/calendar",
  },
  {
    id: 4,
    type: "progress",
    title: "Meta atingida",
    description: "Pedro Costa atingiu 80% da meta de peso",
    time: "2 horas atrás",
    read: true,
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "PC",
    link: "/admin/clients",
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageCircle className="h-4 w-4 text-blue-500" />
    case "client":
      return <UserPlus className="h-4 w-4 text-green-500" />
    case "appointment":
      return <Calendar className="h-4 w-4 text-purple-500" />
    case "progress":
      return <TrendingUp className="h-4 w-4 text-orange-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

export default function NotificationDropdown() {
  const [notificationList, setNotificationList] = useState(notifications)
  const unreadCount = notificationList.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: number) => {
    setNotificationList((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#df0e67] hover:bg-[#df0e67]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {notificationList.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">Nenhuma notificação</div>
          ) : (
            notificationList.map((notification) => (
              <div key={notification.id}>
                <DropdownMenuItem asChild className="p-0">
                  <Link
                    href={notification.link}
                    className={`flex items-start p-3 hover:bg-gray-50 ${!notification.read ? "bg-blue-50/50" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.avatar || "/placeholder.svg"} alt="" />
                          <AvatarFallback className="text-xs">{notification.initials}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">{getNotificationIcon(notification.type)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500 truncate">{notification.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && <div className="h-2 w-2 bg-[#df0e67] rounded-full flex-shrink-0" />}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Link>
                </DropdownMenuItem>
                <Separator />
              </div>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/notifications" className="text-center text-sm text-[#df0e67] font-medium">
            Ver todas as notificações
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
