"use client"

import { useCallback, useContext } from "react"
import { ReportContext } from "@/contexts/report-context"
import {
  type Report,
  type ReportTemplate,
  type CreateReportData,
  type UpdateReportData,
  type ReportFilters,
  ReportStatus,
  ReportType,
} from "@/types/report"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useReports() {
  const { state, dispatch } = useContext(ReportContext)

  if (state === undefined || dispatch === undefined) {
    throw new Error("useReports must be used within a ReportProvider")
  }

  const fetchReports = useCallback(
    async (filters?: ReportFilters) => {
      dispatch({ type: "SET_LOADING", payload: { key: "reports", value: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        await delay(1000)

        let filteredReports = state.reports

        if (filters) {
          if (filters.dateRange) {
            filteredReports = filteredReports.filter((report) => {
              const reportDate = new Date(report.createdAt)
              return reportDate >= filters.dateRange!.start && reportDate <= filters.dateRange!.end
            })
          }
        }

        dispatch({ type: "SET_REPORTS", payload: filteredReports })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao carregar relatórios" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "reports", value: false } })
      }
    },
    [state.reports, dispatch],
  )

  const generateReport = useCallback(
    async (data: CreateReportData) => {
      dispatch({ type: "SET_LOADING", payload: { key: "generating", value: true } })

      try {
        await delay(3000) // Simulate report generation

        const newReport: Report = {
          id: Date.now().toString(),
          ...data,
          status: ReportStatus.COMPLETED,
          data: {
            summary: {
              title: data.name,
              description: data.description,
              period: data.filters.dateRange,
              totalRecords: 0,
              keyMetrics: [],
            },
            metrics: [],
            trends: [],
            comparisons: [],
          },
          charts: [],
          tables: [],
          insights: [],
          createdBy: "current-user",
          createdAt: new Date(),
          updatedAt: new Date(),
          generatedAt: new Date(),
        }

        dispatch({ type: "ADD_REPORT", payload: newReport })
        return newReport
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao gerar relatório" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "generating", value: false } })
      }
    },
    [dispatch],
  )

  const updateReport = useCallback(
    async (id: string, data: UpdateReportData) => {
      dispatch({ type: "SET_LOADING", payload: { key: "updating", value: true } })

      try {
        await delay(1000)

        const existingReport = state.reports.find((report) => report.id === id)
        if (!existingReport) throw new Error("Relatório não encontrado")

        const updatedReport: Report = {
          ...existingReport,
          ...data,
          updatedAt: new Date(),
        }

        dispatch({ type: "UPDATE_REPORT", payload: updatedReport })
        return updatedReport
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar relatório" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "updating", value: false } })
      }
    },
    [state.reports, dispatch],
  )

  const deleteReport = useCallback(
    async (id: string) => {
      dispatch({ type: "SET_LOADING", payload: { key: "deleting", value: true } })

      try {
        await delay(500)
        dispatch({ type: "DELETE_REPORT", payload: id })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao deletar relatório" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "deleting", value: false } })
      }
    },
    [dispatch],
  )

  const selectReport = useCallback(
    (report: Report | null) => {
      dispatch({ type: "SET_SELECTED_REPORT", payload: report })
    },
    [dispatch],
  )

  const setFilters = useCallback(
    (filters: ReportFilters) => {
      dispatch({ type: "SET_FILTERS", payload: filters })
    },
    [dispatch],
  )

  return {
    reports: state.reports,
    selectedReport: state.selectedReport,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    fetchReports,
    generateReport,
    updateReport,
    deleteReport,
    selectReport,
    setFilters,
  }
}

export function useReportTemplates() {
  const { state, dispatch } = useContext(ReportContext)

  if (state === undefined || dispatch === undefined) {
    throw new Error("useReportTemplates must be used within a ReportProvider")
  }

  const fetchTemplates = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "templates", value: true } })

    try {
      await delay(800)
      dispatch({ type: "SET_TEMPLATES", payload: state.templates })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar templates" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "templates", value: false } })
    }
  }, [state.templates, dispatch])

  const createTemplate = useCallback(
    async (data: Omit<ReportTemplate, "id" | "usageCount" | "createdAt" | "updatedAt">) => {
      try {
        await delay(1000)

        const newTemplate: ReportTemplate = {
          ...data,
          id: Date.now().toString(),
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dispatch({ type: "ADD_TEMPLATE", payload: newTemplate })
        return newTemplate
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao criar template" })
        throw error
      }
    },
    [dispatch],
  )

  return {
    templates: state.templates,
    loading: state.loading.templates,
    error: state.error,
    fetchTemplates,
    createTemplate,
  }
}

export function useReportStats() {
  const { state, dispatch } = useContext(ReportContext)

  if (state === undefined || dispatch === undefined) {
    throw new Error("useReportStats must be used within a ReportProvider")
  }

  const fetchStats = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "stats", value: true } })

    try {
      await delay(800)

      if (state.stats) {
        dispatch({ type: "SET_STATS", payload: state.stats })
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar estatísticas" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "stats", value: false } })
    }
  }, [state.stats, dispatch])

  return {
    stats: state.stats,
    loading: state.loading.stats,
    error: state.error,
    fetchStats,
  }
}

export function useReportGeneration() {
  const { generateReport } = useReports()

  const generateClientProgressReport = useCallback(
    async (clientIds: string[], dateRange: { start: Date; end: Date }) => {
      const data: CreateReportData = {
        name: "Relatório de Progresso dos Clientes",
        description: "Análise detalhada do progresso dos clientes selecionados",
        type: ReportType.CLIENT_PROGRESS,
        category: "health" as any,
        format: "pdf" as any,
        filters: {
          dateRange,
          clients: clientIds,
        },
        recipients: [],
      }

      return generateReport(data)
    },
    [generateReport],
  )

  const generateNutritionReport = useCallback(
    async (clientIds: string[], dateRange: { start: Date; end: Date }) => {
      const data: CreateReportData = {
        name: "Relatório de Análise Nutricional",
        description: "Análise detalhada da aderência nutricional dos clientes",
        type: ReportType.NUTRITION_ANALYSIS,
        category: "health" as any,
        format: "pdf" as any,
        filters: {
          dateRange,
          clients: clientIds,
        },
        recipients: [],
      }

      return generateReport(data)
    },
    [generateReport],
  )

  const generateBusinessReport = useCallback(
    async (dateRange: { start: Date; end: Date }) => {
      const data: CreateReportData = {
        name: "Relatório de Métricas de Negócio",
        description: "Análise completa das métricas de negócio e performance",
        type: ReportType.BUSINESS_METRICS,
        category: "business" as any,
        format: "excel" as any,
        filters: {
          dateRange,
        },
        recipients: [],
      }

      return generateReport(data)
    },
    [generateReport],
  )

  return {
    generateClientProgressReport,
    generateNutritionReport,
    generateBusinessReport,
  }
}

export function useReport() {
  const context = useContext(ReportContext)

  if (context === undefined) {
    throw new Error("useReport must be used within a ReportProvider")
  }

  return context
}
