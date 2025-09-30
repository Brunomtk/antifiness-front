"use client"

import { useContext } from "react"
import { NotificationContext } from "@/contexts/notification-context"
import {
  type NotificationFilters,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  type CreateNotificationData,
} from "@/types/notification"

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }

  const {
    state: { notifications, isLoading, isCreating, isUpdating, isDeleting, error, hasMore, page, limit, filters },
    loadNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    setFilters,
    clearNotifications,
    loadMore,
  } = context

  // Computed values
  const unreadCount = notifications.filter((n) => !n.read).length
  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  const notificationsByType = notifications.reduce(
    (acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1
      return acc
    },
    {} as Record<NotificationType, number>,
  )

  const notificationsByCategory = notifications.reduce(
    (acc, notification) => {
      acc[notification.category] = (acc[notification.category] || 0) + 1
      return acc
    },
    {} as Record<NotificationCategory, number>,
  )

  const recentNotifications = notifications
    .filter((n) => {
      const hoursDiff = (Date.now() - new Date(n.createdAt).getTime()) / (1000 * 60 * 60)
      return hoursDiff <= 24
    })
    .slice(0, 5)

  const urgentNotifications = notifications.filter((n) => n.priority === NotificationPriority.URGENT && !n.read)

  return {
    // Data
    notifications,
    unreadNotifications,
    readNotifications,
    recentNotifications,
    urgentNotifications,
    unreadCount,
    notificationsByType,
    notificationsByCategory,

    // States
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    hasMore,
    page,
    limit,
    filters,

    // Actions
    loadNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    setFilters,
    clearNotifications,
    loadMore,
  }
}

export function useNotificationSettings() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationSettings must be used within a NotificationProvider")
  }

  const {
    state: { settings, isLoadingSettings, isUpdatingSettings, error },
    loadSettings,
    updateSettings,
  } = context

  return {
    settings,
    isLoading: isLoadingSettings,
    isUpdating: isUpdatingSettings,
    error,
    loadSettings,
    updateSettings,
  }
}

export function useNotificationStats() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationStats must be used within a NotificationProvider")
  }

  const {
    state: { stats, error },
    loadStats,
  } = context

  return {
    stats,
    error,
    loadStats,
  }
}

export function useNotificationFilters() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationFilters must be used within a NotificationProvider")
  }

  const {
    state: { filters, notifications },
    setFilters,
    loadNotifications,
  } = context

  const applyFilters = async (newFilters: NotificationFilters) => {
    setFilters(newFilters)
    await loadNotifications(newFilters)
  }

  const clearFilters = async () => {
    const emptyFilters: NotificationFilters = {}
    setFilters(emptyFilters)
    await loadNotifications(emptyFilters)
  }

  const filterByType = async (type: NotificationType) => {
    const newFilters = { ...filters, type }
    await applyFilters(newFilters)
  }

  const filterByCategory = async (category: NotificationCategory) => {
    const newFilters = { ...filters, category }
    await applyFilters(newFilters)
  }

  const filterByRead = async (read: boolean) => {
    const newFilters = { ...filters, read }
    await applyFilters(newFilters)
  }

  const searchNotifications = async (search: string) => {
    const newFilters = { ...filters, search }
    await applyFilters(newFilters)
  }

  return {
    filters,
    applyFilters,
    clearFilters,
    filterByType,
    filterByCategory,
    filterByRead,
    searchNotifications,
  }
}

export function useNotificationOperations() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotificationOperations must be used within a NotificationProvider")
  }

  const {
    state: { selectedNotification, isCreating, isUpdating, isDeleting },
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    setSelectedNotification,
  } = context

  const createDietReminder = async (userId: string, mealType: string, time: string) => {
    const data: CreateNotificationData = {
      userId: Number.parseInt(userId, 10),
      type: NotificationType.REMINDER,
      category: NotificationCategory.REMINDER,
      title: `Hora da ${mealType}`,
      message: `Não esqueça de fazer sua ${mealType.toLowerCase()}!`,
      priority: NotificationPriority.NORMAL,
      actionUrl: "/client/diet",
      actionLabel: "Ver Dieta",
      data: {
        entityType: "meal",
        metadata: JSON.stringify({ mealType, time }),
      },
    }

    await createNotification(data)
  }

  const createWorkoutReminder = async (userId: string, workoutName: string) => {
    const data: CreateNotificationData = {
      userId: Number.parseInt(userId, 10),
      type: NotificationType.REMINDER,
      category: NotificationCategory.INFO,
      title: "Hora do Treino! 💪",
      message: `Está na hora do seu treino: ${workoutName}`,
      priority: NotificationPriority.HIGH,
      actionUrl: "/client/workout",
      actionLabel: "Iniciar Treino",
      data: {
        entityType: "workout",
        metadata: JSON.stringify({ workoutName }),
      },
    }

    await createNotification(data)
  }

  const createAchievementNotification = async (userId: string, achievement: string) => {
    const data: CreateNotificationData = {
      userId: Number.parseInt(userId, 10),
      type: NotificationType.ACHIEVEMENT,
      category: NotificationCategory.SUCCESS,
      title: "Nova Conquista! 🎉",
      message: `Parabéns! Você conquistou: ${achievement}`,
      priority: NotificationPriority.HIGH,
      data: {
        entityType: "achievement",
        metadata: JSON.stringify({ achievement }),
      },
    }

    await createNotification(data)
  }

  const createSystemAlert = async (userId: string, title: string, message: string) => {
    const data: CreateNotificationData = {
      userId: Number.parseInt(userId, 10),
      type: NotificationType.SYSTEM,
      category: NotificationCategory.INFO,
      title,
      message,
      priority: NotificationPriority.NORMAL,
    }

    await createNotification(data)
  }

  return {
    selectedNotification,
    isCreating,
    isUpdating,
    isDeleting,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    setSelectedNotification,
    createDietReminder,
    createWorkoutReminder,
    createAchievementNotification,
    createSystemAlert,
  }
}

export function useRealTimeNotifications() {
  const { loadNotifications, createNotification } = useNotifications()

  // Simulate real-time notifications
  const startRealTimeUpdates = () => {
    const interval = setInterval(() => {
      // Simulate receiving a new notification
      const shouldReceive = Math.random() > 0.95 // 5% chance every interval

      if (shouldReceive) {
        const notifications = [
          {
            type: NotificationType.DIET,
            category: NotificationCategory.REMINDER,
            title: "Lembrete de Hidratação",
            message: "Que tal beber um copo de água agora?",
          },
          {
            type: NotificationType.WORKOUT,
            category: NotificationCategory.INFO,
            title: "Dica de Treino",
            message: "Lembre-se de fazer o aquecimento antes do treino!",
          },
        ]

        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]

        createNotification({
          userId: Number.parseInt("user1", 10) || 1,
          ...randomNotification,
          priority: NotificationPriority.NORMAL,
        })
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }

  return {
    startRealTimeUpdates,
  }
}

export const useNotification = useNotifications
