"use client"

import { useCallback, useContext } from "react"
import { ReportContext } from "@/contexts/report-context"
import {
  type Report,
  type ReportTemplate,
  type CreateReportData,
  type UpdateReportData,
  type ReportFilters,
  ReportType,
} from "@/types/report"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useReports() {
  const context = useContext(ReportContext)

  if (context === undefined) {
    throw new Error("useReports must be used within a ReportProvider")
  }

  const fetchReports = useCallback(
    async (filters?: ReportFilters) => {
      await context.fetchReports(filters)
    },
    [context],
  )

  const generateReport = useCallback(
    async (data: CreateReportData) => {
      await context.createReport(data)
    },
    [context],
  )

  const updateReport = useCallback(
    async (id: string, data: UpdateReportData) => {
      await context.updateReport(id, data)
    },
    [context],
  )

  const deleteReport = useCallback(
    async (id: string) => {
      await context.deleteReport(id)
    },
    [context],
  )

  const selectReport = useCallback(
    (report: Report | null) => {
      context.selectReport(report)
    },
    [context],
  )

  const setFilters = useCallback((filters: ReportFilters) => {
    // context.setFilters(filters)
  }, [])

  return {
    reports: context.reports,
    selectedReport: context.selectedReport,
    filters: {}, // Filters not implemented in context yet
    loading: context.loading,
    error: context.error,
    fetchReports,
    generateReport,
    updateReport,
    deleteReport,
    selectReport,
    setFilters,
  }
}

export function useReportTemplates() {
  const context = useContext(ReportContext)

  if (context === undefined) {
    throw new Error("useReportTemplates must be used within a ReportProvider")
  }

  const fetchTemplates = useCallback(async () => {
    await context.fetchTemplates()
  }, [context])

  const createTemplate = useCallback(async (data: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">) => {
    try {
      await delay(1000)

      const newTemplate: ReportTemplate = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return newTemplate
    } catch (error) {
      throw error
    }
  }, [])

  return {
    templates: context.templates,
    loading: context.loading,
    error: context.error,
    fetchTemplates,
    createTemplate,
  }
}

export function useReportStats() {
  const context = useContext(ReportContext)

  if (context === undefined) {
    throw new Error("useReportStats must be used within a ReportProvider")
  }

  const fetchStats = useCallback(async () => {
    await delay(800)
  }, [])

  return {
    stats: null,
    loading: context.loading,
    error: context.error,
    fetchStats,
  }
}

export function useReportGeneration() {
  const { generateReport } = useReports()

  const generateClientProgressReport = useCallback(
    async (clientIds: string[], dateRange: { start: Date; end: Date }) => {
      const data: CreateReportData = {
        title: "Relatório de Progresso dos Clientes",
        type: ReportType.PROGRESS,
        clientId: clientIds[0], // Use first client ID since context expects single client
        period: dateRange,
        data: {
          summary: "Análise detalhada do progresso dos clientes selecionados",
          metrics: [],
          charts: [],
          recommendations: [],
        },
      }

      return generateReport(data)
    },
    [generateReport],
  )

  const generateNutritionReport = useCallback(
    async (clientIds: string[], dateRange: { start: Date; end: Date }) => {
      const data: CreateReportData = {
        title: "Relatório de Análise Nutricional",
        type: ReportType.NUTRITION,
        clientId: clientIds[0], // Use first client ID since context expects single client
        period: dateRange,
        data: {
          summary: "Análise detalhada da aderência nutricional dos clientes",
          metrics: [],
          charts: [],
          recommendations: [],
        },
      }

      return generateReport(data)
    },
    [generateReport],
  )

  const generateBusinessReport = useCallback(
    async (dateRange: { start: Date; end: Date }) => {
      const data: CreateReportData = {
        title: "Relatório de Métricas de Negócio",
        type: ReportType.GENERAL,
        clientId: "business", // Use placeholder client ID for business reports
        period: dateRange,
        data: {
          summary: "Análise completa das métricas de negócio e performance",
          metrics: [],
          charts: [],
          recommendations: [],
        },
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
