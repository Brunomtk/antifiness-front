"use client"

import type React from "react"
import { createContext, useReducer, useCallback } from "react"
import type {
  DashboardStats,
  DashboardChart,
  DashboardWidget,
  DashboardLayout,
  RecentActivity,
  UpcomingTask,
  DashboardNotification,
  DashboardFilters,
  DashboardPreferences,
} from "@/types/dashboard"

interface DashboardState {
  stats: DashboardStats | null
  charts: DashboardChart[]
  widgets: DashboardWidget[]
  layouts: DashboardLayout[]
  currentLayout: DashboardLayout | null
  recentActivities: RecentActivity[]
  upcomingTasks: UpcomingTask[]
  notifications: DashboardNotification[]
  preferences: DashboardPreferences | null
  loading: boolean
  error: string | null
}

type DashboardAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_STATS"; payload: DashboardStats }
  | { type: "SET_CHARTS"; payload: DashboardChart[] }
  | { type: "SET_WIDGETS"; payload: DashboardWidget[] }
  | { type: "SET_LAYOUTS"; payload: DashboardLayout[] }
  | { type: "SET_CURRENT_LAYOUT"; payload: DashboardLayout }
  | { type: "SET_RECENT_ACTIVITIES"; payload: RecentActivity[] }
  | { type: "SET_UPCOMING_TASKS"; payload: UpcomingTask[] }
  | { type: "SET_NOTIFICATIONS"; payload: DashboardNotification[] }
  | { type: "SET_PREFERENCES"; payload: DashboardPreferences }
  | { type: "UPDATE_WIDGET"; payload: { id: string; data: Partial<DashboardWidget> } }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "COMPLETE_TASK"; payload: string }

interface DashboardContextType extends DashboardState {
  fetchDashboardData: (filters?: DashboardFilters) => Promise<void>
  fetchStats: (filters?: DashboardFilters) => Promise<void>
  fetchCharts: (filters?: DashboardFilters) => Promise<void>
  fetchRecentActivities: () => Promise<void>
  fetchUpcomingTasks: () => Promise<void>
  fetchNotifications: () => Promise<void>
  updateWidget: (id: string, data: Partial<DashboardWidget>) => Promise<void>
  saveLayout: (layout: Omit<DashboardLayout, "id" | "createdAt" | "updatedAt">) => Promise<void>
  setCurrentLayout: (layoutId: string) => Promise<void>
  markNotificationAsRead: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<void>
  updatePreferences: (preferences: Partial<DashboardPreferences>) => Promise<void>
}

const initialState: DashboardState = {
  stats: null,
  charts: [],
  widgets: [],
  layouts: [],
  currentLayout: null,
  recentActivities: [],
  upcomingTasks: [],
  notifications: [],
  preferences: null,
  loading: false,
  error: null,
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_STATS":
      return { ...state, stats: action.payload, loading: false, error: null }
    case "SET_CHARTS":
      return { ...state, charts: action.payload, loading: false, error: null }
    case "SET_WIDGETS":
      return { ...state, widgets: action.payload, loading: false, error: null }
    case "SET_LAYOUTS":
      return { ...state, layouts: action.payload, loading: false, error: null }
    case "SET_CURRENT_LAYOUT":
      return { ...state, currentLayout: action.payload, loading: false, error: null }
    case "SET_RECENT_ACTIVITIES":
      return { ...state, recentActivities: action.payload, loading: false, error: null }
    case "SET_UPCOMING_TASKS":
      return { ...state, upcomingTasks: action.payload, loading: false, error: null }
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload, loading: false, error: null }
    case "SET_PREFERENCES":
      return { ...state, preferences: action.payload, loading: false, error: null }
    case "UPDATE_WIDGET":
      return {
        ...state,
        widgets: state.widgets.map((widget) =>
          widget.id === action.payload.id ? { ...widget, ...action.payload.data } : widget,
        ),
      }
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload ? { ...notification, isRead: true } : notification,
        ),
      }
    case "COMPLETE_TASK":
      return {
        ...state,
        upcomingTasks: state.upcomingTasks.map((task) =>
          task.id === action.payload ? { ...task, status: "completed" } : task,
        ),
      }
    default:
      return state
  }
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  const fetchDashboardData = useCallback(async (filters?: DashboardFilters) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Fetch all dashboard data in parallel
      await Promise.all([
        fetchStats(filters),
        fetchCharts(filters),
        fetchRecentActivities(),
        fetchUpcomingTasks(),
        fetchNotifications(),
      ])
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar dados do dashboard" })
    }
  }, [])

  const fetchStats = useCallback(async (filters?: DashboardFilters) => {
    try {
      // Mock stats - replace with actual API call
      const mockStats: DashboardStats = {
        totalClients: 45,
        activeClients: 38,
        newClientsThisMonth: 8,
        totalPlans: 25,
        activePlans: 18,
        completedPlans: 7,
        totalRevenue: 15000,
        monthlyRevenue: 3500,
        averageClientSatisfaction: 4.6,
        pendingTasks: 12,
      }

      dispatch({ type: "SET_STATS", payload: mockStats })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar estatísticas" })
    }
  }, [])

  const fetchCharts = useCallback(async (filters?: DashboardFilters) => {
    try {
      // Mock charts - replace with actual API call
      const mockCharts: DashboardChart[] = [
        {
          id: "1",
          title: "Novos Clientes",
          type: "line",
          data: [
            { month: "Jan", clients: 5 },
            { month: "Fev", clients: 8 },
            { month: "Mar", clients: 12 },
            { month: "Abr", clients: 7 },
          ],
          config: {
            xAxis: "month",
            yAxis: "clients",
            colors: ["#3b82f6"],
          },
        },
      ]

      dispatch({ type: "SET_CHARTS", payload: mockCharts })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar gráficos" })
    }
  }, [])

  const fetchRecentActivities = useCallback(async () => {
    try {
      // Mock activities - replace with actual API call
      const mockActivities: RecentActivity[] = [
        {
          id: "1",
          type: "client_added",
          title: "Novo cliente adicionado",
          description: "Maria Silva foi adicionada como nova cliente",
          userName: "Dr. João",
          timestamp: new Date(),
        },
      ]

      dispatch({ type: "SET_RECENT_ACTIVITIES", payload: mockActivities })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar atividades recentes" })
    }
  }, [])

  const fetchUpcomingTasks = useCallback(async () => {
    try {
      // Mock tasks - replace with actual API call
      const mockTasks: UpcomingTask[] = [
        {
          id: "1",
          title: "Consulta com Maria Silva",
          type: "appointment",
          priority: "high",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          clientName: "Maria Silva",
          status: "pending",
        },
      ]

      dispatch({ type: "SET_UPCOMING_TASKS", payload: mockTasks })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar tarefas" })
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      // Mock notifications - replace with actual API call
      const mockNotifications: DashboardNotification[] = [
        {
          id: "1",
          title: "Nova mensagem",
          message: "Você tem uma nova mensagem de Maria Silva",
          type: "info",
          priority: "medium",
          isRead: false,
          createdAt: new Date(),
        },
      ]

      dispatch({ type: "SET_NOTIFICATIONS", payload: mockNotifications })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar notificações" })
    }
  }, [])

  const updateWidget = useCallback(async (id: string, data: Partial<DashboardWidget>) => {
    try {
      // Mock update - replace with actual API call
      dispatch({ type: "UPDATE_WIDGET", payload: { id, data } })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar widget" })
    }
  }, [])

  const saveLayout = useCallback(
    async (layout: Omit<DashboardLayout, "id" | "createdAt" | "updatedAt">) => {
      try {
        // Mock save - replace with actual API call
        const newLayout: DashboardLayout = {
          ...layout,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dispatch({ type: "SET_LAYOUTS", payload: [...state.layouts, newLayout] })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao salvar layout" })
      }
    },
    [state.layouts],
  )

  const setCurrentLayout = useCallback(
    async (layoutId: string) => {
      try {
        const layout = state.layouts.find((l) => l.id === layoutId)
        if (layout) {
          dispatch({ type: "SET_CURRENT_LAYOUT", payload: layout })
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao definir layout" })
      }
    },
    [state.layouts],
  )

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      // Mock mark as read - replace with actual API call
      dispatch({ type: "MARK_NOTIFICATION_READ", payload: id })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao marcar notificação como lida" })
    }
  }, [])

  const completeTask = useCallback(async (id: string) => {
    try {
      // Mock complete task - replace with actual API call
      dispatch({ type: "COMPLETE_TASK", payload: id })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao completar tarefa" })
    }
  }, [])

  const updatePreferences = useCallback(
    async (preferences: Partial<DashboardPreferences>) => {
      try {
        // Mock update preferences - replace with actual API call
        const updatedPreferences = { ...state.preferences, ...preferences } as DashboardPreferences
        dispatch({ type: "SET_PREFERENCES", payload: updatedPreferences })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar preferências" })
      }
    },
    [state.preferences],
  )

  const value: DashboardContextType = {
    ...state,
    fetchDashboardData,
    fetchStats,
    fetchCharts,
    fetchRecentActivities,
    fetchUpcomingTasks,
    fetchNotifications,
    updateWidget,
    saveLayout,
    setCurrentLayout,
    markNotificationAsRead,
    completeTask,
    updatePreferences,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}
