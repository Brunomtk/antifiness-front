"use client"

import { useCallback, useContext } from "react"
import { DashboardContext } from "@/contexts/dashboard-context"
import {
  type DashboardWidget,
  type DashboardFilters,
  type DashboardExport,
  type TimePeriod,
  type ChartPeriod, // Added ChartPeriod import
  ExportFormat,
  type DashboardStats, // Declare DashboardStats here
} from "@/types/dashboard"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useDashboard() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }

  const { stats, loading, error, fetchStats } = context

  const refreshData = useCallback(async () => {
    try {
      await fetchStats()
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }, [fetchStats])

  const setAutoRefresh = useCallback((enabled: boolean) => {
    // Mock implementation - in real app would update preferences
    console.log("Auto refresh:", enabled)
  }, [])

  const setRefreshInterval = useCallback((interval: number) => {
    // Mock implementation - in real app would update preferences
    console.log("Refresh interval:", interval)
  }, [])

  return {
    stats,
    loading,
    error,
    lastUpdated: new Date(), // Mock value
    autoRefresh: false, // Mock value
    refreshInterval: 30000, // Mock value
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

  const { stats, loading, error, fetchStats } = context

  const fetchStatsWithFilters = useCallback(
    async (filters?: DashboardFilters) => {
      await fetchStats(filters)
    },
    [fetchStats],
  )

  const getStatsByPeriod = useCallback(
    (period: TimePeriod) => {
      // Mock implementation - in real app, this would filter data by period
      return stats
    },
    [stats],
  )

  return {
    stats,
    filters: {}, // Mock filters
    loading,
    error,
    fetchStats: fetchStatsWithFilters,
    getStatsByPeriod,
  }
}

export function useDashboardWidgets() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardWidgets must be used within a DashboardProvider")
  }

  const { widgets, loading, error, updateWidget: contextUpdateWidget } = context

  const fetchWidgets = useCallback(async () => {
    // Mock implementation - widgets are already loaded
    console.log("Fetching widgets")
  }, [])

  const updateWidget = useCallback(
    async (widget: DashboardWidget) => {
      await contextUpdateWidget(widget.id, widget)
    },
    [contextUpdateWidget],
  )

  const addWidget = useCallback(async (widget: Omit<DashboardWidget, "id">) => {
    const newWidget: DashboardWidget = {
      ...widget,
      id: Date.now().toString(),
    }
    return newWidget
  }, [])

  const removeWidget = useCallback(async (widgetId: string) => {
    // Mock implementation
    console.log("Removing widget:", widgetId)
  }, [])

  const toggleWidgetVisibility = useCallback(
    async (widgetId: string) => {
      const widget = widgets.find((w) => w.id === widgetId)
      if (widget) {
        await updateWidget({ ...widget, isVisible: !widget.isVisible })
      }
    },
    [widgets, updateWidget],
  )

  return {
    widgets,
    loading,
    error,
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

  const { charts, loading, error, fetchCharts: contextFetchCharts } = context

  const fetchCharts = useCallback(async () => {
    await contextFetchCharts()
  }, [contextFetchCharts])

  const getChartsByPeriod = useCallback(
    (period: ChartPeriod) => {
      // Changed from TimePeriod to ChartPeriod
      return charts.filter((chart) => chart.config.period === period)
    },
    [charts],
  )

  return {
    charts,
    loading,
    error,
    fetchCharts,
    getChartsByPeriod,
  }
}

export function useDashboardInsights() {
  const context = useContext(DashboardContext)

  if (context === undefined) {
    throw new Error("useDashboardInsights must be used within a DashboardProvider")
  }

  const { loading, error } = context

  const fetchInsights = useCallback(async () => {
    console.log("Fetching insights")
  }, [])

  const getActionableInsights = useCallback(() => {
    return []
  }, [])

  const getInsightsBySeverity = useCallback((severity: string) => {
    return []
  }, [])

  return {
    insights: [],
    loading,
    error,
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

  const { notifications, loading, error, markNotificationAsRead } = context

  const fetchAlerts = useCallback(async () => {
    console.log("Fetching alerts")
  }, [])

  const markAlertAsRead = useCallback(
    async (alertId: string) => {
      await markNotificationAsRead(alertId)
    },
    [markNotificationAsRead],
  )

  const dismissAlert = useCallback(async (alertId: string) => {
    console.log("Dismissing alert:", alertId)
  }, [])

  const getUnreadAlerts = useCallback(() => {
    return notifications.filter((alert) => !alert.isRead)
  }, [notifications])

  const getAlertsBySeverity = useCallback(
    (severity: string) => {
      return notifications.filter((alert) => alert.priority === severity)
    },
    [notifications],
  )

  return {
    alerts: notifications,
    loading,
    error,
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

  const setFilters = useCallback((filters: DashboardFilters) => {
    console.log("Setting filters:", filters)
  }, [])

  const setPeriod = useCallback((period: TimePeriod) => {
    console.log("Setting period:", period)
  }, [])

  const setDateRange = useCallback((dateRange: { start: Date; end: Date }) => {
    console.log("Setting date range:", dateRange)
  }, [])

  return {
    filters: {},
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

  const { stats } = context

  const getGrowthRate = useCallback(
    (metric: keyof DashboardStats) => {
      if (!stats) return 0
      // Mock implementation
      return 0
    },
    [stats],
  )

  const getTopMetrics = useCallback(() => {
    if (!stats) return []

    return [
      { name: "Clientes Ativos", value: stats.activeClients, change: 2.5 },
      { name: "Taxa de Conclusão", value: 85, change: 2.3 },
      { name: "Aderência", value: 78, change: 1.8 },
      { name: "Satisfação", value: stats.averageClientSatisfaction, change: 0.3 },
    ]
  }, [stats])

  const getPerformanceScore = useCallback(() => {
    if (!stats) return 0
    return 85 // Mock score
  }, [stats])

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

  const { stats, charts, loading, error } = context

  const exportData = useCallback(async (format: ExportFormat, data: any, filename: string) => {
    await delay(2000) // Simulate export processing

    const exportData: DashboardExport = {
      format,
      data,
      filename,
      createdAt: new Date(),
    }

    console.log("Exporting data:", exportData)
    return exportData
  }, [])

  const exportStats = useCallback(
    async (format: ExportFormat = ExportFormat.PDF) => {
      return exportData(format, stats, `dashboard-stats-${Date.now()}`)
    },
    [stats, exportData],
  )

  const exportCharts = useCallback(
    async (format: ExportFormat = ExportFormat.PDF) => {
      return exportData(format, charts, `dashboard-charts-${Date.now()}`)
    },
    [charts, exportData],
  )

  return {
    loading,
    error,
    exportData,
    exportStats,
    exportCharts,
  }
}
