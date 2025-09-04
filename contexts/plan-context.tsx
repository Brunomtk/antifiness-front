"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import type { Plan, CreatePlanData, UpdatePlanData, PlanFilters, PlanStats, PlanPagination } from "@/types/plan"
import { planService } from "@/services/plan-service"

interface PlanState {
  // Plans Management
  plans: Plan[]
  selectedPlan: Plan | null

  // Pagination
  pagination: PlanPagination

  // Filters & Search
  filters: PlanFilters
  searchResults: Plan[]

  // Stats
  stats: PlanStats | null

  // Loading States
  loading: boolean
  operationLoading: {
    creating: boolean
    updating: boolean
    deleting: boolean
    fetching: boolean
  }

  // Errors
  error: string | null
}

type PlanAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_OPERATION_LOADING"; payload: { operation: keyof PlanState["operationLoading"]; loading: boolean } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PLANS"; payload: { plans: Plan[]; pagination: PlanPagination } }
  | { type: "ADD_PLAN"; payload: Plan }
  | { type: "UPDATE_PLAN"; payload: { id: number; data: Partial<Plan> } }
  | { type: "DELETE_PLAN"; payload: number }
  | { type: "SET_SELECTED_PLAN"; payload: Plan | null }
  | { type: "SET_FILTERS"; payload: PlanFilters }
  | { type: "SET_SEARCH_RESULTS"; payload: Plan[] }
  | { type: "SET_STATS"; payload: PlanStats }

const initialState: PlanState = {
  plans: [],
  selectedPlan: null,
  pagination: {
    currentPage: 1,
    pageCount: 1,
    pageSize: 20,
    rowCount: 0,
    firstRowOnPage: 1,
    lastRowOnPage: 1,
  },
  filters: {},
  searchResults: [],
  stats: null,
  loading: false,
  operationLoading: {
    creating: false,
    updating: false,
    deleting: false,
    fetching: false,
  },
  error: null,
}

function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_OPERATION_LOADING":
      return {
        ...state,
        operationLoading: {
          ...state.operationLoading,
          [action.payload.operation]: action.payload.loading,
        },
      }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "SET_PLANS":
      return {
        ...state,
        plans: action.payload.plans,
        pagination: action.payload.pagination,
        loading: false,
      }

    case "ADD_PLAN":
      return {
        ...state,
        plans: [action.payload, ...state.plans],
        operationLoading: { ...state.operationLoading, creating: false },
      }

    case "UPDATE_PLAN":
      return {
        ...state,
        plans: state.plans.map((plan) => (plan.id === action.payload.id ? { ...plan, ...action.payload.data } : plan)),
        selectedPlan:
          state.selectedPlan?.id === action.payload.id
            ? { ...state.selectedPlan, ...action.payload.data }
            : state.selectedPlan,
        operationLoading: { ...state.operationLoading, updating: false },
      }

    case "DELETE_PLAN":
      return {
        ...state,
        plans: state.plans.filter((plan) => plan.id !== action.payload),
        selectedPlan: state.selectedPlan?.id === action.payload ? null : state.selectedPlan,
        operationLoading: { ...state.operationLoading, deleting: false },
      }

    case "SET_SELECTED_PLAN":
      return { ...state, selectedPlan: action.payload }

    case "SET_FILTERS":
      return { ...state, filters: action.payload }

    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload }

    case "SET_STATS":
      return { ...state, stats: action.payload }

    default:
      return state
  }
}

interface PlanContextType {
  state: PlanState

  // Plan Management Actions
  fetchPlans: (options?: { page?: number; pageSize?: number; filters?: PlanFilters }) => Promise<void>
  fetchPlan: (id: number) => Promise<void>
  createPlan: (planData: CreatePlanData) => Promise<Plan>
  updatePlan: (id: number, planData: UpdatePlanData) => Promise<void>
  deletePlan: (id: number) => Promise<void>

  // Search & Filter Actions
  searchPlans: (query: string) => Promise<void>
  setFilters: (filters: PlanFilters) => void
  clearFilters: () => void

  // Stats Actions
  fetchStats: () => Promise<void>

  // UI Actions
  selectPlan: (plan: Plan | null) => void
  clearError: () => void
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(planReducer, initialState)

  // Plan Management Actions
  const fetchPlans = useCallback(async (options?: { page?: number; pageSize?: number; filters?: PlanFilters }) => {
    dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "fetching", loading: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const { page = 1, pageSize = 20, filters } = options || {}
      const response = await planService.getPlans(page, pageSize, filters)

      dispatch({
        type: "SET_PLANS",
        payload: {
          plans: response.results,
          pagination: {
            currentPage: response.currentPage,
            pageCount: response.pageCount,
            pageSize: response.pageSize,
            rowCount: response.rowCount,
            firstRowOnPage: response.firstRowOnPage,
            lastRowOnPage: response.lastRowOnPage,
          },
        },
      })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro ao buscar planos",
      })
    } finally {
      dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "fetching", loading: false } })
    }
  }, [])

  const fetchPlan = useCallback(async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const plan = await planService.getPlan(id)
      dispatch({ type: "SET_SELECTED_PLAN", payload: plan })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro ao buscar plano",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const createPlan = useCallback(async (planData: CreatePlanData): Promise<Plan> => {
    dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "creating", loading: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const newPlan = await planService.createPlan(planData)
      dispatch({ type: "ADD_PLAN", payload: newPlan })
      return newPlan
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro ao criar plano",
      })
      throw error
    } finally {
      dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "creating", loading: false } })
    }
  }, [])

  const updatePlan = useCallback(async (id: number, planData: UpdatePlanData) => {
    dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "updating", loading: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      await planService.updatePlan(id, planData)
      dispatch({ type: "UPDATE_PLAN", payload: { id, data: planData } })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro ao atualizar plano",
      })
      throw error
    } finally {
      dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "updating", loading: false } })
    }
  }, [])

  const deletePlan = useCallback(async (id: number) => {
    dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "deleting", loading: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      await planService.deletePlan(id)
      dispatch({ type: "DELETE_PLAN", payload: id })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro ao deletar plano",
      })
      throw error
    } finally {
      dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "deleting", loading: false } })
    }
  }, [])

  // Search & Filter Actions
  const searchPlans = useCallback(async (query: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const response = await planService.getPlans(1, 100, { search: query })
      dispatch({ type: "SET_SEARCH_RESULTS", payload: response.results })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro na busca",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const setFilters = useCallback((filters: PlanFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const clearFilters = useCallback(() => {
    dispatch({ type: "SET_FILTERS", payload: {} })
  }, [])

  // Stats Actions
  const fetchStats = useCallback(async () => {
    try {
      const stats = await planService.getPlanStats()
      dispatch({ type: "SET_STATS", payload: stats })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro ao buscar estatísticas",
      })
    }
  }, [])

  // UI Actions
  const selectPlan = useCallback((plan: Plan | null) => {
    dispatch({ type: "SET_SELECTED_PLAN", payload: plan })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null })
  }, [])

  const value: PlanContextType = {
    state,
    fetchPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,
    searchPlans,
    setFilters,
    clearFilters,
    fetchStats,
    selectPlan,
    clearError,
  }

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlanContext() {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error("usePlanContext must be used within a PlanProvider")
  }
  return context
}
