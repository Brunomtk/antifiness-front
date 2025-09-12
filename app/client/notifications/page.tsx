"use client"

import { useState } from "react"
import {
  Bell,
  Check,
  Search,
  Trash2,
  MessageSquare,
  Utensils,
  Dumbbell,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"
import {
  useClientNotifications,
  getNotificationTypeLabel,
  getNotificationPriorityLabel,
} from "@/hooks/use-client-notifications"
import { NotificationType, NotificationCategory, NotificationPriority } from "@/types/notification"
import Link from "next/link"

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.MESSAGE:
      return MessageSquare
    case NotificationType.DIET:
      return Utensils
    case NotificationType.WORKOUT:
      return Dumbbell
    case NotificationType.PLAN:
      return FileText
    case NotificationType.ALERT:
      return AlertTriangle
    case NotificationType.ACHIEVEMENT:
      return CheckCircle
    default:
      return Bell
  }
}

const getCategoryIcon = (category: NotificationCategory) => {
  switch (category) {
    case NotificationCategory.SUCCESS:
      return CheckCircle
    case NotificationCategory.WARNING:
      return AlertTriangle
    case NotificationCategory.ERROR:
      return XCircle
    case NotificationCategory.INFO:
      return Info
    default:
      return Bell
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Agora"
  if (diffInMinutes < 60) return `${diffInMinutes}min atrás`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h atrás`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d atrás`

  return date.toLocaleDateString("pt-BR")
}

const groupNotificationsByDate = (notifications: any[]) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: { [key: string]: any[] } = {
    today: [],
    yesterday: [],
    older: [],
  }

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.createdAt)

    if (notificationDate.toDateString() === today.toDateString()) {
      groups.today.push(notification)
    } else if (notificationDate.toDateString() === yesterday.toDateString()) {
      groups.yesterday.push(notification)
    } else {
      groups.older.push(notification)
    }
  })

  return groups
}

export default function NotificationsPage() {
  const isMobile = useMobile()
  const {
    notifications,
    unreadCount,
    isLoading,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    applyFilters,
    clearFilters,
    setError,
  } = useClientNotifications()

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Filtrar notificações localmente
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || notification.type.toString() === typeFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && !notification.read) ||
      (statusFilter === "read" && notification.read)

    return matchesSearch && matchesType && matchesStatus
  })

  const groupedNotifications = groupNotificationsByDate(filteredNotifications)

  const handleApplyFilters = async () => {
    const filters: any = {}

    if (typeFilter !== "all") {
      filters.type = Number.parseInt(typeFilter) as NotificationType
    }

    if (statusFilter === "read") {
      filters.read = true
    } else if (statusFilter === "unread") {
      filters.read = false
    }

    await applyFilters(filters)
  }

  const handleClearFilters = async () => {
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
    await clearFilters()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-3 md:p-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2 bg-transparent"
                onClick={() => {
                  setError(null)
                  window.location.reload()
                }}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl">
              {isMobile ? "Notificações" : "Notificações"}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {isMobile ? "Suas atualizações" : "Acompanhe todas as suas notificações e atualizações"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              disabled={isMarkingAllAsRead}
              className="bg-[#df0e67] hover:bg-[#df0e67]/90 w-full md:w-auto"
              size={isMobile ? "sm" : "default"}
            >
              <Check className="mr-2 h-4 w-4" />
              {isMarkingAllAsRead
                ? "Marcando..."
                : isMobile
                  ? `Marcar todas (${unreadCount})`
                  : `Marcar todas como lidas (${unreadCount})`}
            </Button>
          )}
        </div>

        {/* Filtros */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="space-y-3 md:space-y-0 md:flex md:flex-row md:items-center md:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={isMobile ? "Buscar..." : "Buscar notificações..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[120px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value={NotificationType.SYSTEM.toString()}>Sistema</SelectItem>
                    <SelectItem value={NotificationType.DIET.toString()}>Dieta</SelectItem>
                    <SelectItem value={NotificationType.WORKOUT.toString()}>Treino</SelectItem>
                    <SelectItem value={NotificationType.PLAN.toString()}>Plano</SelectItem>
                    <SelectItem value={NotificationType.MESSAGE.toString()}>Mensagem</SelectItem>
                    <SelectItem value={NotificationType.REMINDER.toString()}>Lembrete</SelectItem>
                    <SelectItem value={NotificationType.ACHIEVEMENT.toString()}>Conquista</SelectItem>
                    <SelectItem value={NotificationType.ALERT.toString()}>Alerta</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[100px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">Não lidas</SelectItem>
                    <SelectItem value="read">Lidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                <Button variant="outline" onClick={handleApplyFilters} size={isMobile ? "sm" : "default"}>
                  Aplicar
                </Button>
                <Button variant="ghost" onClick={handleClearFilters} size={isMobile ? "sm" : "default"}>
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3 md:space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 md:h-4 w-3/4" />
                      <Skeleton className="h-2 md:h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lista de notificações */}
        {!isLoading && (
          <div className="space-y-4 md:space-y-6">
            {/* Hoje */}
            {groupedNotifications.today.length > 0 && (
              <div>
                <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">Hoje</h2>
                <div className="space-y-2">
                  {groupedNotifications.today.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    return (
                      <Card
                        key={notification.id}
                        className={`transition-colors hover:bg-gray-50 border-none shadow-sm ${
                          !notification.read ? "border-l-4 border-l-[#df0e67] bg-[#df0e67]/5" : ""
                        }`}
                      >
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`rounded-full p-2 flex-shrink-0 ${
                                notification.category === NotificationCategory.SUCCESS
                                  ? "bg-green-100"
                                  : notification.category === NotificationCategory.WARNING
                                    ? "bg-yellow-100"
                                    : notification.category === NotificationCategory.ERROR
                                      ? "bg-red-100"
                                      : notification.category === NotificationCategory.INFO
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                              }`}
                            >
                              <Icon
                                className={`h-4 w-4 md:h-5 md:w-5 ${
                                  notification.category === NotificationCategory.SUCCESS
                                    ? "text-green-600"
                                    : notification.category === NotificationCategory.WARNING
                                      ? "text-yellow-600"
                                      : notification.category === NotificationCategory.ERROR
                                        ? "text-red-600"
                                        : notification.category === NotificationCategory.INFO
                                          ? "text-blue-600"
                                          : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm md:text-base line-clamp-2">
                                    {notification.title}
                                  </h3>
                                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notification.read && <div className="h-2 w-2 rounded-full bg-[#df0e67]" />}
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div className="flex gap-1 md:gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {getNotificationTypeLabel(notification.type)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs capitalize ${
                                      notification.priority === NotificationPriority.URGENT
                                        ? "border-red-500 text-red-700"
                                        : notification.priority === NotificationPriority.HIGH
                                          ? "border-orange-500 text-orange-700"
                                          : ""
                                    }`}
                                  >
                                    {getNotificationPriorityLabel(notification.priority)}
                                  </Badge>
                                </div>
                                <div className="flex gap-1 md:gap-2">
                                  {notification.actionUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2 md:h-9 md:px-3 bg-transparent text-xs"
                                      asChild
                                    >
                                      <Link href={notification.actionUrl}>
                                        {isMobile ? "Ver" : notification.actionLabel || "Ver"}
                                      </Link>
                                    </Button>
                                  )}
                                  {!notification.read && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 md:h-9 md:w-9 p-0 bg-transparent"
                                      onClick={() => markAsRead(notification.id)}
                                      disabled={isMarkingAsRead}
                                    >
                                      <Check className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 md:h-9 md:w-9 p-0 bg-transparent"
                                    onClick={() => deleteNotification(notification.id)}
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Ontem */}
            {groupedNotifications.yesterday.length > 0 && (
              <div>
                <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">Ontem</h2>
                <div className="space-y-2">
                  {groupedNotifications.yesterday.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    return (
                      <Card
                        key={notification.id}
                        className={`transition-colors hover:bg-gray-50 border-none shadow-sm ${
                          !notification.read ? "border-l-4 border-l-[#df0e67] bg-[#df0e67]/5" : ""
                        }`}
                      >
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`rounded-full p-2 flex-shrink-0 ${
                                notification.category === NotificationCategory.SUCCESS
                                  ? "bg-green-100"
                                  : notification.category === NotificationCategory.WARNING
                                    ? "bg-yellow-100"
                                    : notification.category === NotificationCategory.ERROR
                                      ? "bg-red-100"
                                      : notification.category === NotificationCategory.INFO
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                              }`}
                            >
                              <Icon
                                className={`h-4 w-4 md:h-5 md:w-5 ${
                                  notification.category === NotificationCategory.SUCCESS
                                    ? "text-green-600"
                                    : notification.category === NotificationCategory.WARNING
                                      ? "text-yellow-600"
                                      : notification.category === NotificationCategory.ERROR
                                        ? "text-red-600"
                                        : notification.category === NotificationCategory.INFO
                                          ? "text-blue-600"
                                          : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm md:text-base line-clamp-2">
                                    {notification.title}
                                  </h3>
                                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notification.read && <div className="h-2 w-2 rounded-full bg-[#df0e67]" />}
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div className="flex gap-1 md:gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {getNotificationTypeLabel(notification.type)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs capitalize ${
                                      notification.priority === NotificationPriority.URGENT
                                        ? "border-red-500 text-red-700"
                                        : notification.priority === NotificationPriority.HIGH
                                          ? "border-orange-500 text-orange-700"
                                          : ""
                                    }`}
                                  >
                                    {getNotificationPriorityLabel(notification.priority)}
                                  </Badge>
                                </div>
                                <div className="flex gap-1 md:gap-2">
                                  {notification.actionUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2 md:h-9 md:px-3 bg-transparent text-xs"
                                      asChild
                                    >
                                      <Link href={notification.actionUrl}>
                                        {isMobile ? "Ver" : notification.actionLabel || "Ver"}
                                      </Link>
                                    </Button>
                                  )}
                                  {!notification.read && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 md:h-9 md:w-9 p-0 bg-transparent"
                                      onClick={() => markAsRead(notification.id)}
                                      disabled={isMarkingAsRead}
                                    >
                                      <Check className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 md:h-9 md:w-9 p-0 bg-transparent"
                                    onClick={() => deleteNotification(notification.id)}
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Mais antigas */}
            {groupedNotifications.older.length > 0 && (
              <div>
                <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">Mais antigas</h2>
                <div className="space-y-2">
                  {groupedNotifications.older.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    return (
                      <Card
                        key={notification.id}
                        className={`transition-colors hover:bg-gray-50 border-none shadow-sm ${
                          !notification.read ? "border-l-4 border-l-[#df0e67] bg-[#df0e67]/5" : ""
                        }`}
                      >
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`rounded-full p-2 flex-shrink-0 ${
                                notification.category === NotificationCategory.SUCCESS
                                  ? "bg-green-100"
                                  : notification.category === NotificationCategory.WARNING
                                    ? "bg-yellow-100"
                                    : notification.category === NotificationCategory.ERROR
                                      ? "bg-red-100"
                                      : notification.category === NotificationCategory.INFO
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                              }`}
                            >
                              <Icon
                                className={`h-4 w-4 md:h-5 md:w-5 ${
                                  notification.category === NotificationCategory.SUCCESS
                                    ? "text-green-600"
                                    : notification.category === NotificationCategory.WARNING
                                      ? "text-yellow-600"
                                      : notification.category === NotificationCategory.ERROR
                                        ? "text-red-600"
                                        : notification.category === NotificationCategory.INFO
                                          ? "text-blue-600"
                                          : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm md:text-base line-clamp-2">
                                    {notification.title}
                                  </h3>
                                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notification.read && <div className="h-2 w-2 rounded-full bg-[#df0e67]" />}
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div className="flex gap-1 md:gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {getNotificationTypeLabel(notification.type)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs capitalize ${
                                      notification.priority === NotificationPriority.URGENT
                                        ? "border-red-500 text-red-700"
                                        : notification.priority === NotificationPriority.HIGH
                                          ? "border-orange-500 text-orange-700"
                                          : ""
                                    }`}
                                  >
                                    {getNotificationPriorityLabel(notification.priority)}
                                  </Badge>
                                </div>
                                <div className="flex gap-1 md:gap-2">
                                  {notification.actionUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2 md:h-9 md:px-3 bg-transparent text-xs"
                                      asChild
                                    >
                                      <Link href={notification.actionUrl}>
                                        {isMobile ? "Ver" : notification.actionLabel || "Ver"}
                                      </Link>
                                    </Button>
                                  )}
                                  {!notification.read && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 md:h-9 md:w-9 p-0 bg-transparent"
                                      onClick={() => markAsRead(notification.id)}
                                      disabled={isMarkingAsRead}
                                    >
                                      <Check className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 md:h-9 md:w-9 p-0 bg-transparent"
                                    onClick={() => deleteNotification(notification.id)}
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Estado vazio */}
            {filteredNotifications.length === 0 && !isLoading && (
              <Card className="border-none shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <Bell className="mb-4 h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                  <h3 className="text-base md:text-lg font-medium">Nenhuma notificação encontrada</h3>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                      ? "Tente ajustar os filtros para ver mais resultados."
                      : "Você não tem notificações no momento."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
