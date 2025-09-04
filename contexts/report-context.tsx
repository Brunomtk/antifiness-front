"use client"

import type React from "react"
import { createContext, useReducer, useCallback } from "react"
import type { Report, CreateReportData, UpdateReportData, ReportFilters, ReportTemplate } from "@/types/report"

interface ReportState {
  reports: Report[]
  templates: ReportTemplate[]
  loading: boolean
  error: string | null
  selectedReport: Report | null
}

type ReportAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_REPORTS"; payload: Report[] }
  | { type: "SET_TEMPLATES"; payload: ReportTemplate[] }
  | { type: "ADD_REPORT"; payload: Report }
  | { type: "UPDATE_REPORT"; payload: { id: string; data: Partial<Report> } }
  | { type: "DELETE_REPORT"; payload: string }
  | { type: "SET_SELECTED_REPORT"; payload: Report | null }

interface ReportContextType extends ReportState {
  fetchReports: (filters?: ReportFilters) => Promise<void>
  fetchTemplates: () => Promise<void>
  createReport: (data: CreateReportData) => Promise<void>
  updateReport: (id: string, data: UpdateReportData) => Promise<void>
  deleteReport: (id: string) => Promise<void>
  generateReport: (clientId: string, type: string, period: { start: Date; end: Date }) => Promise<void>
  sendReport: (id: string) => Promise<void>
  selectReport: (report: Report | null) => void
  getReportById: (id: string) => Report | undefined
}

const initialState: ReportState = {
  reports: [],
  templates: [],
  loading: false,
  error: null,
  selectedReport: null,
}

function reportReducer(state: ReportState, action: ReportAction): ReportState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_REPORTS":
      return { ...state, reports: action.payload, loading: false, error: null }
    case "SET_TEMPLATES":
      return { ...state, templates: action.payload, loading: false, error: null }
    case "ADD_REPORT":
      return { ...state, reports: [action.payload, ...state.reports] }
    case "UPDATE_REPORT":
      return {
        ...state,
        reports: state.reports.map((report) =>
          report.id === action.payload.id ? { ...report, ...action.payload.data } : report,
        ),
      }
    case "DELETE_REPORT":
      return {
        ...state,
        reports: state.reports.filter((report) => report.id !== action.payload),
      }
    case "SET_SELECTED_REPORT":
      return { ...state, selectedReport: action.payload }
    default:
      return state
  }
}

export const ReportContext = createContext<ReportContextType | undefined>(undefined)

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reportReducer, initialState)

  const fetchReports = useCallback(async (filters?: ReportFilters) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Mock data - replace with actual API call
      const mockReports: Report[] = [
        {
          id: "1",
          title: "Relatório de Progresso - Maria Silva",
          type: "progress",
          clientId: "1",
          clientName: "Maria Silva",
          nutritionistId: "1",
          period: {
            start: new Date("2024-01-01"),
            end: new Date("2024-01-31"),
          },
          data: {
            summary: "Cliente apresentou excelente progresso no período.",
            metrics: [
              {
                id: "1",
                name: "Peso",
                value: 68.5,
                unit: "kg",
                change: { value: -2.5, percentage: -3.5, trend: "down" },
                target: 65,
              },
            ],
            charts: [],
            recommendations: ["Manter dieta atual", "Aumentar atividade física"],
          },
          status: "completed",
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-02-01"),
        },
      ]

      dispatch({ type: "SET_REPORTS", payload: mockReports })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar relatórios" })
    }
  }, [])

  const fetchTemplates = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Mock templates - replace with actual API call
      const mockTemplates: ReportTemplate[] = [
        {
          id: "1",
          name: "Relatório de Progresso Padrão",
          type: "progress",
          description: "Template padrão para relatórios de progresso",
          structure: {
            sections: ["Resumo", "Métricas", "Gráficos", "Recomendações"],
            metrics: ["Peso", "IMC", "Percentual de Gordura"],
            charts: ["Evolução do Peso", "Composição Corporal"],
          },
          isDefault: true,
        },
      ]

      dispatch({ type: "SET_TEMPLATES", payload: mockTemplates })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar templates" })
    }
  }, [])

  const createReport = useCallback(async (data: CreateReportData) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Mock creation - replace with actual API call
      const newReport: Report = {
        id: Date.now().toString(),
        ...data,
        clientName: "Cliente",
        nutritionistId: "1",
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      dispatch({ type: "ADD_REPORT", payload: newReport })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao criar relatório" })
    }
  }, [])

  const updateReport = useCallback(async (id: string, data: UpdateReportData) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Mock update - replace with actual API call
      const updatedData = {
        ...data,
        updatedAt: new Date(),
      }

      dispatch({ type: "UPDATE_REPORT", payload: { id, data: updatedData } })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar relatório" })
    }
  }, [])

  const deleteReport = useCallback(async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Mock deletion - replace with actual API call
      dispatch({ type: "DELETE_REPORT", payload: id })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao deletar relatório" })
    }
  }, [])

  const generateReport = useCallback(async (clientId: string, type: string, period: { start: Date; end: Date }) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Mock generation - replace with actual API call
      const generatedReport: Report = {
        id: Date.now().toString(),
        title: `Relatório Gerado - ${new Date().toLocaleDateString()}`,
        type: type as any,
        clientId,
        clientName: "Cliente",
        nutritionistId: "1",
        period,
        data: {
          summary: "Relatório gerado automaticamente.",
          metrics: [],
          charts: [],
          recommendations: [],
        },
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      dispatch({ type: "ADD_REPORT", payload: generatedReport })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao gerar relatório" })
    }
  }, [])

  const sendReport = useCallback(async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      // Mock sending - replace with actual API call
      dispatch({ type: "UPDATE_REPORT", payload: { id, data: { status: "sent" } } })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao enviar relatório" })
    }
  }, [])

  const selectReport = useCallback((report: Report | null) => {
    dispatch({ type: "SET_SELECTED_REPORT", payload: report })
  }, [])

  const getReportById = useCallback(
    (id: string) => {
      return state.reports.find((report) => report.id === id)
    },
    [state.reports],
  )

  const value: ReportContextType = {
    ...state,
    fetchReports,
    fetchTemplates,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    sendReport,
    selectReport,
    getReportById,
  }

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
}
