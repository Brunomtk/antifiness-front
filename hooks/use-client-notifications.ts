"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationService } from "@/services/notification-service"
import { useUser } from "@/hooks/use-user"
import type {
  Notification,
  NotificationStats,
  NotificationFilters,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from "@/types/notification"

export function useClientNotifications() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false)
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<NotificationFilters>({})

  const loadNotifications = useCallback(
    async (customFilters?: NotificationFilters) => {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const filterParams = {
          ...filters,
          ...customFilters,
          userId: user.id,
        }

        const data = await notificationService.getNotifications(filterParams)
        setNotifications(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar notificações")
      } finally {
        setIsLoading(false)
      }
    },
    [user?.id, filters],
  )

  const loadStats = useCallback(async () => {
    if (!user?.id) return

    try {
      const data = await notificationService.getStats(user.id)
      setStats(data)
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err)
    }
  }, [user?.id])

  const markAsRead = useCallback(
    async (id: number) => {
      setIsMarkingAsRead(true)
      setError(null)

      try {
        await notificationService.markAsRead(id)

        // Atualizar localmente
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: true, readAt: new Date().toISOString() } : notification,
          ),
        )

        // Recarregar estatísticas
        await loadStats()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao marcar como lida")
      } finally {
        setIsMarkingAsRead(false)
      }
    },
    [loadStats],
  )

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    setIsMarkingAllAsRead(true)
    setError(null)

    try {
      await notificationService.markAllAsRead(user.id)

      // Atualizar localmente
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
        })),
      )

      // Recarregar estatísticas
      await loadStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao marcar todas como lidas")
    } finally {
      setIsMarkingAllAsRead(false)
    }
  }, [user?.id, loadStats])

  const deleteNotification = useCallback(
    async (id: number) => {
      setIsDeleting(true)
      setError(null)

      try {
        await notificationService.deleteNotification(id)

        // Remover localmente
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))

        // Recarregar estatísticas
        await loadStats()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao deletar notificação")
      } finally {
        setIsDeleting(false)
      }
    },
    [loadStats],
  )

  const applyFilters = useCallback(
    async (newFilters: NotificationFilters) => {
      setFilters(newFilters)
      await loadNotifications(newFilters)
    },
    [loadNotifications],
  )

  const clearFilters = useCallback(async () => {
    setFilters({})
    await loadNotifications({})
  }, [loadNotifications])

  // Computed values
  const unreadNotifications = notifications.filter((n) => !n.read)
  const unreadCount = unreadNotifications.length
  const readNotifications = notifications.filter((n) => n.read)

  const notificationsByType = notifications.reduce(
    (acc, notification) => {
      const type = notification.type.toString()
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const notificationsByCategory = notifications.reduce(
    (acc, notification) => {
      const category = notification.category.toString()
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const recentNotifications = notifications
    .filter((n) => {
      const hoursDiff = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60)
      return hoursDiff <= 24
    })
    .slice(0, 5)

  const urgentNotifications = notifications.filter((n) => n.priority === "URGENT" && !n.read)

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      loadStats()
    }
  }, [user?.id, loadNotifications, loadStats])

  return {
    // Data
    notifications,
    unreadNotifications,
    readNotifications,
    recentNotifications,
    urgentNotifications,
    stats,
    unreadCount,
    notificationsByType,
    notificationsByCategory,
    filters,

    // States
    isLoading,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
    error,

    // Actions
    loadNotifications,
    loadStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    applyFilters,
    clearFilters,
    setError,
  }
}

// Helper functions
export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case "SYSTEM":
      return "Sistema"
    case "DIET":
      return "Dieta"
    case "WORKOUT":
      return "Treino"
    case "PLAN":
      return "Plano"
    case "MESSAGE":
      return "Mensagem"
    case "REMINDER":
      return "Lembrete"
    case "ACHIEVEMENT":
      return "Conquista"
    case "ALERT":
      return "Alerta"
    default:
      return "Desconhecido"
  }
}

export function getNotificationCategoryLabel(category: NotificationCategory): string {
  switch (category) {
    case "INFO":
      return "Informação"
    case "SUCCESS":
      return "Sucesso"
    case "WARNING":
      return "Aviso"
    case "ERROR":
      return "Erro"
    case "REMINDER":
      return "Lembrete"
    default:
      return "Desconhecido"
  }
}

export function getNotificationPriorityLabel(priority: NotificationPriority): string {
  switch (priority) {
    case "LOW":
      return "Baixa"
    case "NORMAL":
      return "Normal"
    case "HIGH":
      return "Alta"
    case "URGENT":
      return "Urgente"
    default:
      return "Desconhecido"
  }
}
