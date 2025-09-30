"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationService } from "@/services/notification-service"
import { useUser } from "@/hooks/use-user"
import type {Notification,
  NotificationStats,
  NotificationFilters} from "@/types/notification";
import { NotificationCategory } from "@/types/notification";
import { NotificationType } from "@/types/notification";
import { NotificationPriority } from "@/types/notification";export function useClientNotifications() {
  const __u: any = useUser();
  const currentUser = __u?.currentUser ?? __u?.user ?? __u?.state?.user ?? null;
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
      if (!currentUser?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const filterParams = {
          ...filters,
          ...customFilters,
          userId: currentUser.id,
        }

        const data = await notificationService.getNotifications(filterParams)
        setNotifications(data.notifications)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar notificações")
      } finally {
        setIsLoading(false)
      }
    },
    [currentUser?.id, filters],
  )

  const loadStats = useCallback(async () => {
    if (!currentUser?.id) return

    try {
      const data = await notificationService.getStats(currentUser.id)
      setStats(data)
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err)
    }
  }, [currentUser?.id])

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
    if (!currentUser?.id) return

    setIsMarkingAllAsRead(true)
    setError(null)

    try {
      await notificationService.markAllAsRead(currentUser.id)

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
  }, [currentUser?.id, loadStats])

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

  const urgentNotifications = notifications.filter((n) => n.priority === NotificationPriority.URGENT && !n.read)

  // Load data on mount and when user changes
  useEffect(() => {
    if (currentUser?.id) {
      loadNotifications()
      loadStats()
    }
  }, [currentUser?.id, loadNotifications, loadStats])

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
    case NotificationType.SYSTEM:
      return "Sistema"
    case NotificationType.DIET:
      return "Dieta"
    case NotificationType.WORKOUT:
      return "Treino"
    case NotificationType.PLAN:
      return "Plano"
    case NotificationType.MESSAGE:
      return "Mensagem"
    case NotificationType.REMINDER:
      return "Lembrete"
    case NotificationType.ACHIEVEMENT:
      return "Conquista"
    case NotificationType.ALERT:
      return "Alerta"
    default:
      return "Desconhecido"
  }
}

export function getNotificationCategoryLabel(category: NotificationCategory): string {
  switch (category) {
    case NotificationCategory.INFO:
      return "Informação"
    case NotificationCategory.SUCCESS:
      return "Sucesso"
    case NotificationCategory.WARNING:
      return "Aviso"
    case NotificationCategory.ERROR:
      return "Erro"
    case NotificationCategory.REMINDER:
      return "Lembrete"
    default:
      return "Desconhecido"
  }
}

export function getNotificationPriorityLabel(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.LOW:
      return "Baixa"
    case NotificationPriority.NORMAL:
      return "Normal"
    case NotificationPriority.HIGH:
      return "Alta"
    case NotificationPriority.URGENT:
      return "Urgente"
    default:
      return "Desconhecido"
  }
}
