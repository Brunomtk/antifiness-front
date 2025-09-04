"use client"

import { useCallback, useContext } from "react"
import { DashboardContext } from "@/contexts/dashboard-context"
import {
  type DashboardWidget,
  type DashboardFilters,
  type DashboardExport,
  TimePeriod,
  ExportFormat,
  type DashboardStats, // Declare DashboardStats here
} from "@/types/dashboard"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useDashboard() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }

  const { state, dispatch } = context

  const refreshData = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "stats", value: true } })

    try {
      await delay(1000)
      dispatch({ type: "SET_LAST_UPDATED", payload: new Date() })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar dados" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "stats", value: false } })
    }
  }, [dispatch])

  const setAutoRefresh = useCallback(
    (enabled: boolean) => {
      dispatch({ type: "SET_AUTO_REFRESH", payload: enabled })
    },
    [dispatch],
  )

  const setRefreshInterval = useCallback(
    (interval: number) => {
      dispatch({ type: "SET_REFRESH_INTERVAL", payload: interval })
    },
    [dispatch],
  )

  return {
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    autoRefresh: state.autoRefresh,
    refreshInterval: state.refreshInterval,
    refreshData,
    setAutoRefresh,
    setRefreshInterval,
  }
}

export function useDashboardStats() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardStats must be used within a DashboardProvider")
  }

  const { state, dispatch } = context

  const fetchStats = useCallback(
    async (filters?: DashboardFilters) => {
      dispatch({ type: "SET_LOADING", payload: { key: "stats", value: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        await delay(800)

        if (filters) {
          dispatch({ type: "SET_FILTERS", payload: filters })
        }

        if (state.stats) {
          dispatch({ type: "SET_STATS", payload: state.stats })
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao carregar estatísticas" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "stats", value: false } })
      }
    },
    [state.stats, dispatch],
  )

  const getStatsByPeriod = useCallback(
    (period: TimePeriod) => {
      // Mock implementation - in real app, this would filter data by period
      return state.stats
    },
    [state.stats],
  )

  return {
    stats: state.stats,
    filters: state.filters,
    loading: state.loading.stats,
    error: state.error,
    fetchStats,
    getStatsByPeriod,
  }
}

export function useDashboardWidgets() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardWidgets must be used within a DashboardProvider")
  }

  const { state, dispatch } = context

  const fetchWidgets = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "widgets", value: true } })

    try {
      await delay(500)
      dispatch({ type: "SET_WIDGETS", payload: state.widgets })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar widgets" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "widgets", value: false } })
    }
  }, [state.widgets, dispatch])

  const updateWidget = useCallback(
    async (widget: DashboardWidget) => {
      try {
        await delay(300)
        dispatch({ type: "UPDATE_WIDGET", payload: widget })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar widget" })
      }
    },
    [dispatch],
  )

  const addWidget = useCallback(
    async (widget: Omit<DashboardWidget, "id">) => {
      try {
        await delay(300)

        const newWidget: DashboardWidget = {
          ...widget,
          id: Date.now().toString(),
        }

        dispatch({ type: "ADD_WIDGET", payload: newWidget })
        return newWidget
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao adicionar widget" })
        throw error
      }
    },
    [dispatch],
  )

  const removeWidget = useCallback(
    async (widgetId: string) => {
      try {
        await delay(200)
        dispatch({ type: "REMOVE_WIDGET", payload: widgetId })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao remover widget" })
      }
    },
    [dispatch],
  )

  const toggleWidgetVisibility = useCallback(
    async (widgetId: string) => {
      const widget = state.widgets.find((w) => w.id === widgetId)
      if (widget) {
        await updateWidget({ ...widget, isVisible: !widget.isVisible })
      }
    },
    [state.widgets, updateWidget],
  )

  return {
    widgets: state.widgets,
    loading: state.loading.widgets,
    error: state.error,
    fetchWidgets,
    updateWidget,
    addWidget,
    removeWidget,
    toggleWidgetVisibility,
  }
}

export function useDashboardCharts() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardCharts must be used within a DashboardProvider")
  }

  const { state, dispatch } = context

  const fetchCharts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "charts", value: true } })

    try {
      await delay(800)
      dispatch({ type: "SET_CHARTS", payload: state.charts })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar gráficos" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "charts", value: false } })
    }
  }, [state.charts, dispatch])

  const getChartsByPeriod = useCallback(
    (period: TimePeriod) => {
      return state.charts.filter((chart) => chart.period === period)
    },
    [state.charts],
  )

  return {
    charts: state.charts,
    loading: state.loading.charts,
    error: state.error,
    fetchCharts,
    getChartsByPeriod,
  }
}

export function useDashboardInsights() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardInsights must be used within a DashboardProvider")
  }

  const { state, dispatch } = context

  const fetchInsights = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "insights", value: true } })

    try {
      await delay(1000)
      dispatch({ type: "SET_INSIGHTS", payload: state.insights })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar insights" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "insights", value: false } })
    }
  }, [state.insights, dispatch])

  const getActionableInsights = useCallback(() => {
    return state.insights.filter((insight) => insight.actionable)
  }, [state.insights])

  const getInsightsBySeverity = useCallback(
    (severity: string) => {
      return state.insights.filter((insight) => insight.severity === severity)
    },
    [state.insights],
  )

  return {
    insights: state.insights,
    loading: state.loading.insights,
    error: state.error,
    fetchInsights,
    getActionableInsights,
    getInsightsBySeverity,
  }
}

export function useDashboardAlerts() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardAlerts must be used within a DashboardProvider")
  }

  const { state, dispatch } = context

  const fetchAlerts = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "alerts", value: true } })

    try {
      await delay(500)
      dispatch({ type: "SET_ALERTS", payload: state.alerts })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar alertas" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "alerts", value: false } })
    }
  }, [state.alerts, dispatch])

  const markAlertAsRead = useCallback(
    async (alertId: string) => {
      try {
        await delay(200)
        dispatch({ type: "MARK_ALERT_READ", payload: alertId })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao marcar alerta como lido" })
      }
    },
    [dispatch],
  )

  const dismissAlert = useCallback(
    async (alertId: string) => {
      try {
        await delay(200)
        dispatch({ type: "DISMISS_ALERT", payload: alertId })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao dispensar alerta" })
      }
    },
    [dispatch],
  )

  const getUnreadAlerts = useCallback(() => {
    return state.alerts.filter((alert) => !alert.isRead)
  }, [state.alerts])

  const getAlertsBySeverity = useCallback(
    (severity: string) => {
      return state.alerts.filter((alert) => alert.severity === severity)
    },
    [state.alerts],
  )

  return {
    alerts: state.alerts,
    loading: state.loading.alerts,
    error: state.error,
    fetchAlerts,
    markAlertAsRead,
    dismissAlert,
    getUnreadAlerts,
    getAlertsBySeverity,
  }
}

export function useDashboardFilters() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardFilters must be used within a DashboardProvider")
  }

  const { state, dispatch } = context

  const setFilters = useCallback(
    (filters: DashboardFilters) => {
      dispatch({ type: "SET_FILTERS", payload: filters })
    },
    [dispatch],
  )

  const setPeriod = useCallback(
    (period: TimePeriod) => {
      const newFilters = { ...state.filters, period }
      dispatch({ type: "SET_FILTERS", payload: newFilters })
    },
    [state.filters, dispatch],
  )

  const setDateRange = useCallback(
    (dateRange: { start: Date; end: Date }) => {
      const newFilters = { ...state.filters, dateRange, period: TimePeriod.CUSTOM }
      dispatch({ type: "SET_FILTERS", payload: newFilters })
    },
    [state.filters, dispatch],
  )

  return {
    filters: state.filters,
    setFilters,
    setPeriod,
    setDateRange,
  }
}

export function useDashboardAnalytics() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardAnalytics must be used within a DashboardProvider")
  }

  const { state } = context

  const getGrowthRate = useCallback(
    (metric: keyof DashboardStats) => {
      if (!state.stats) return 0
      const data = state.stats[metric] as any
      return data?.growth || 0
    },
    [state.stats],
  )

  const getTopMetrics = useCallback(() => {
    if (!state.stats) return []

    return [
      { name: "Clientes Ativos", value: state.stats.clients.active, change: state.stats.clients.growth },
      { name: "Taxa de Conclusão", value: state.stats.plans.completionRate, change: 2.3 },
      { name: "Aderência", value: state.stats.workouts.adherence, change: 1.8 },
      { name: "Satisfação", value: state.stats.satisfaction.average, change: 0.3 },
    ]
  }, [state.stats])

  const getPerformanceScore = useCallback(() => {
    if (!state.stats) return 0

    const scores = [
      state.stats.clients.growth / 20, // Max 20% growth = 100 points
      state.stats.plans.completionRate / 100, // Max 100% = 100 points
      state.stats.workouts.adherence / 100, // Max 100% = 100 points
      state.stats.satisfaction.average / 5, // Max 5.0 = 100 points
    ]

    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100)
  }, [state.stats])

  return {
    getGrowthRate,
    getTopMetrics,
    getPerformanceScore,
  }
}

export function useDashboardExport() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardExport must be used within a DashboardProvider")
  }

  const { state, dispatch } = context

  const exportData = useCallback(
    async (format: ExportFormat, data: any, filename: string) => {
      dispatch({ type: "SET_LOADING", payload: { key: "exporting", value: true } })

      try {
        await delay(2000) // Simulate export processing

        const exportData: DashboardExport = {
          format,
          data,
          filename,
          createdAt: new Date(),
        }

        // In a real app, this would trigger the actual export
        console.log("Exporting data:", exportData)

        return exportData
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao exportar dados" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "exporting", value: false } })
      }
    },
    [dispatch],
  )

  const exportStats = useCallback(
    async (format: ExportFormat = ExportFormat.PDF) => {
      return exportData(format, state.stats, `dashboard-stats-${Date.now()}`)
    },
    [state.stats, exportData],
  )

  const exportCharts = useCallback(
    async (format: ExportFormat = ExportFormat.PDF) => {
      return exportData(format, state.charts, `dashboard-charts-${Date.now()}`)
    },
    [state.charts, exportData],
  )

  return {
    loading: state.loading.exporting,
    error: state.error,
    exportData,
    exportStats,
    exportCharts,
  }
}
