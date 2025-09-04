"use client"

import { createContext, useReducer, useEffect, type ReactNode } from "react"
import {
  type Notification,
  type NotificationSettings,
  type NotificationStats,
  type NotificationFilters,
  type CreateNotificationData,
  type UpdateNotificationData,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationFrequency,
} from "@/types/notification"

interface NotificationState {
  notifications: Notification[]
  settings: NotificationSettings | null
  stats: NotificationStats | null
  filters: NotificationFilters
  selectedNotification: Notification | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isLoadingSettings: boolean
  isUpdatingSettings: boolean
  error: string | null
  hasMore: boolean
  page: number
  limit: number
}

type NotificationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CREATING"; payload: boolean }
  | { type: "SET_UPDATING"; payload: boolean }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SET_LOADING_SETTINGS"; payload: boolean }
  | { type: "SET_UPDATING_SETTINGS"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "UPDATE_NOTIFICATION"; payload: { id: string; data: Partial<Notification> } }
  | { type: "DELETE_NOTIFICATION"; payload: string }
  | { type: "SET_SELECTED_NOTIFICATION"; payload: Notification | null }
  | { type: "SET_SETTINGS"; payload: NotificationSettings }
  | { type: "SET_STATS"; payload: NotificationStats }
  | { type: "SET_FILTERS"; payload: NotificationFilters }
  | { type: "SET_PAGINATION"; payload: { hasMore: boolean; page: number; limit: number } }
  | { type: "MARK_ALL_READ" }
  | { type: "CLEAR_NOTIFICATIONS" }

const initialState: NotificationState = {
  notifications: [],
  settings: null,
  stats: null,
  filters: {},
  selectedNotification: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isLoadingSettings: false,
  isUpdatingSettings: false,
  error: null,
  hasMore: true,
  page: 1,
  limit: 20,
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_CREATING":
      return { ...state, isCreating: action.payload }
    case "SET_UPDATING":
      return { ...state, isUpdating: action.payload }
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload }
    case "SET_LOADING_SETTINGS":
      return { ...state, isLoadingSettings: action.payload }
    case "SET_UPDATING_SETTINGS":
      return { ...state, isUpdatingSettings: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload }
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.payload, ...state.notifications] }
    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload.id ? { ...notification, ...action.payload.data } : notification,
        ),
      }
    case "DELETE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.payload),
      }
    case "SET_SELECTED_NOTIFICATION":
      return { ...state, selectedNotification: action.payload }
    case "SET_SETTINGS":
      return { ...state, settings: action.payload }
    case "SET_STATS":
      return { ...state, stats: action.payload }
    case "SET_FILTERS":
      return { ...state, filters: action.payload }
    case "SET_PAGINATION":
      return { ...state, ...action.payload }
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date(),
        })),
      }
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] }
    default:
      return state
  }
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "user1",
    type: NotificationType.DIET,
    category: NotificationCategory.REMINDER,
    title: "Hora do Lanche da Tarde",
    message: "Não esqueça de fazer seu lanche da tarde! Frutas e castanhas estão no seu plano.",
    priority: NotificationPriority.NORMAL,
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    actionUrl: "/client/diet",
    actionLabel: "Ver Dieta",
    data: {
      entityId: "meal-3",
      entityType: "meal",
      metadata: { mealType: "lanche_tarde" },
    },
  },
  {
    id: "2",
    userId: "user1",
    type: NotificationType.WORKOUT,
    category: NotificationCategory.SUCCESS,
    title: "Treino Concluído! 🎉",
    message: "Parabéns! Você completou seu treino de hoje. Continue assim!",
    priority: NotificationPriority.HIGH,
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    data: {
      entityId: "workout-1",
      entityType: "workout",
      progress: 100,
    },
  },
  {
    id: "3",
    userId: "user1",
    type: NotificationType.ACHIEVEMENT,
    category: NotificationCategory.SUCCESS,
    title: "Nova Conquista Desbloqueada!",
    message: "Você completou 7 dias consecutivos de treino! Parabéns pela dedicação.",
    priority: NotificationPriority.HIGH,
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    readAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    data: {
      entityId: "achievement-7days",
      entityType: "achievement",
      metadata: { streak: 7 },
    },
  },
  {
    id: "4",
    userId: "user1",
    type: NotificationType.MESSAGE,
    category: NotificationCategory.INFO,
    title: "Nova Mensagem do Nutricionista",
    message: "Dr. André enviou uma nova mensagem sobre seu progresso.",
    priority: NotificationPriority.NORMAL,
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    actionUrl: "/client/messages",
    actionLabel: "Ver Mensagem",
  },
  {
    id: "5",
    userId: "user1",
    type: NotificationType.PLAN,
    category: NotificationCategory.WARNING,
    title: "Plano Expirando em Breve",
    message: "Seu plano nutricional expira em 3 dias. Entre em contato para renovar.",
    priority: NotificationPriority.HIGH,
    read: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    actionUrl: "/client/plans",
    actionLabel: "Ver Planos",
  },
]

const mockSettings: NotificationSettings = {
  id: "1",
  userId: "user1",
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  categories: {
    [NotificationCategory.INFO]: true,
    [NotificationCategory.SUCCESS]: true,
    [NotificationCategory.WARNING]: true,
    [NotificationCategory.ERROR]: true,
    [NotificationCategory.REMINDER]: true,
  },
  types: {
    [NotificationType.SYSTEM]: true,
    [NotificationType.DIET]: true,
    [NotificationType.WORKOUT]: true,
    [NotificationType.PLAN]: true,
    [NotificationType.MESSAGE]: true,
    [NotificationType.REMINDER]: true,
    [NotificationType.ACHIEVEMENT]: true,
    [NotificationType.ALERT]: true,
  },
  quietHours: {
    enabled: true,
    startTime: "22:00",
    endTime: "07:00",
  },
  frequency: NotificationFrequency.IMMEDIATE,
  updatedAt: new Date(),
}

const mockStats: NotificationStats = {
  total: 156,
  unread: 12,
  byType: {
    [NotificationType.SYSTEM]: 15,
    [NotificationType.DIET]: 45,
    [NotificationType.WORKOUT]: 38,
    [NotificationType.PLAN]: 8,
    [NotificationType.MESSAGE]: 25,
    [NotificationType.REMINDER]: 18,
    [NotificationType.ACHIEVEMENT]: 5,
    [NotificationType.ALERT]: 2,
  },
  byCategory: {
    [NotificationCategory.INFO]: 78,
    [NotificationCategory.SUCCESS]: 32,
    [NotificationCategory.WARNING]: 15,
    [NotificationCategory.ERROR]: 3,
    [NotificationCategory.REMINDER]: 28,
  },
  byPriority: {
    [NotificationPriority.LOW]: 45,
    [NotificationPriority.NORMAL]: 89,
    [NotificationPriority.HIGH]: 20,
    [NotificationPriority.URGENT]: 2,
  },
  readRate: 92.3,
  averageReadTime: 2.5,
  mostActiveHour: 14,
  weeklyTrend: [12, 15, 8, 22, 18, 25, 14],
}

interface NotificationContextType {
  state: NotificationState
  loadNotifications: (filters?: NotificationFilters) => Promise<void>
  createNotification: (data: CreateNotificationData) => Promise<void>
  updateNotification: (id: string, data: UpdateNotificationData) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>
  loadStats: () => Promise<void>
  setFilters: (filters: NotificationFilters) => void
  setSelectedNotification: (notification: Notification | null) => void
  clearNotifications: () => void
  loadMore: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  const loadNotifications = async (filters?: NotificationFilters) => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      let filteredNotifications = [...mockNotifications]

      if (filters?.type?.length) {
        filteredNotifications = filteredNotifications.filter((n) => filters.type!.includes(n.type))
      }

      if (filters?.category?.length) {
        filteredNotifications = filteredNotifications.filter((n) => filters.category!.includes(n.category))
      }

      if (filters?.read !== undefined) {
        filteredNotifications = filteredNotifications.filter((n) => n.read === filters.read)
      }

      if (filters?.search) {
        const search = filters.search.toLowerCase()
        filteredNotifications = filteredNotifications.filter(
          (n) => n.title.toLowerCase().includes(search) || n.message.toLowerCase().includes(search),
        )
      }

      dispatch({ type: "SET_NOTIFICATIONS", payload: filteredNotifications })
      dispatch({ type: "SET_FILTERS", payload: filters || {} })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar notificações" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const createNotification = async (data: CreateNotificationData) => {
    dispatch({ type: "SET_CREATING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newNotification: Notification = {
        id: Date.now().toString(),
        ...data,
        read: false,
        createdAt: new Date(),
        priority: data.priority || NotificationPriority.NORMAL,
      }

      dispatch({ type: "ADD_NOTIFICATION", payload: newNotification })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao criar notificação" })
    } finally {
      dispatch({ type: "SET_CREATING", payload: false })
    }
  }

  const updateNotification = async (id: string, data: UpdateNotificationData) => {
    dispatch({ type: "SET_UPDATING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      dispatch({ type: "UPDATE_NOTIFICATION", payload: { id, data } })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar notificação" })
    } finally {
      dispatch({ type: "SET_UPDATING", payload: false })
    }
  }

  const deleteNotification = async (id: string) => {
    dispatch({ type: "SET_DELETING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      dispatch({ type: "DELETE_NOTIFICATION", payload: id })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao deletar notificação" })
    } finally {
      dispatch({ type: "SET_DELETING", payload: false })
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      dispatch({
        type: "UPDATE_NOTIFICATION",
        payload: {
          id,
          data: { read: true, readAt: new Date() },
        },
      })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao marcar como lida" })
    }
  }

  const markAllAsRead = async () => {
    dispatch({ type: "SET_UPDATING", payload: true })

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      dispatch({ type: "MARK_ALL_READ" })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao marcar todas como lidas" })
    } finally {
      dispatch({ type: "SET_UPDATING", payload: false })
    }
  }

  const loadSettings = async () => {
    dispatch({ type: "SET_LOADING_SETTINGS", payload: true })

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      dispatch({ type: "SET_SETTINGS", payload: mockSettings })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar configurações" })
    } finally {
      dispatch({ type: "SET_LOADING_SETTINGS", payload: false })
    }
  }

  const updateSettings = async (settings: Partial<NotificationSettings>) => {
    dispatch({ type: "SET_UPDATING_SETTINGS", payload: true })

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const updatedSettings = { ...mockSettings, ...settings, updatedAt: new Date() }
      dispatch({ type: "SET_SETTINGS", payload: updatedSettings })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar configurações" })
    } finally {
      dispatch({ type: "SET_UPDATING_SETTINGS", payload: false })
    }
  }

  const loadStats = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      dispatch({ type: "SET_STATS", payload: mockStats })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar estatísticas" })
    }
  }

  const setFilters = (filters: NotificationFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }

  const setSelectedNotification = (notification: Notification | null) => {
    dispatch({ type: "SET_SELECTED_NOTIFICATION", payload: notification })
  }

  const clearNotifications = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" })
  }

  const loadMore = async () => {
    if (!state.hasMore || state.isLoading) return

    dispatch({ type: "SET_LOADING", payload: true })

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Simulate loading more notifications
      const moreNotifications = mockNotifications.slice(0, 3)
      dispatch({ type: "SET_NOTIFICATIONS", payload: [...state.notifications, ...moreNotifications] })
      dispatch({
        type: "SET_PAGINATION",
        payload: {
          hasMore: false,
          page: state.page + 1,
          limit: state.limit,
        },
      })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar mais notificações" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  useEffect(() => {
    loadNotifications()
    loadSettings()
    loadStats()
  }, [])

  const value: NotificationContextType = {
    state,
    loadNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    loadSettings,
    updateSettings,
    loadStats,
    setFilters,
    setSelectedNotification,
    clearNotifications,
    loadMore,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export { NotificationContext }
