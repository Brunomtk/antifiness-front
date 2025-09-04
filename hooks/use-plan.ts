"use client"

import { useCallback } from "react"
import { usePlanContext } from "@/contexts/plan-context"
import { planService } from "@/services/plan-service"
import type { Plan, CreatePlanData, UpdatePlanData } from "@/types/plan"

// Hook principal para planos
export function usePlans() {
  const { state, fetchPlans, deletePlan, searchPlans, setFilters, clearFilters, dispatch } = usePlanContext()

  const createPlan = useCallback(
    async (data: CreatePlanData) => {
      dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "creating", loading: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        const newPlan = await planService.createPlan(data)
        dispatch({ type: "ADD_PLAN", payload: newPlan })
        return newPlan
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao criar plano"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw error
      } finally {
        dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "creating", loading: false } })
      }
    },
    [dispatch],
  )

  const updatePlan = useCallback(
    async (id: number, data: UpdatePlanData) => {
      dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "updating", loading: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        await planService.updatePlan(id, data)
        dispatch({ type: "UPDATE_PLAN", payload: { id, data } })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar plano"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw error
      } finally {
        dispatch({ type: "SET_OPERATION_LOADING", payload: { operation: "updating", loading: false } })
      }
    },
    [dispatch],
  )

  const selectPlan = useCallback(
    (plan: Plan | null) => {
      dispatch({ type: "SET_SELECTED_PLAN", payload: plan })
    },
    [dispatch],
  )

  return {
    plans: state.plans,
    pagination: state.pagination,
    loading: state.operationLoading.fetching,
    error: state.error,
    operationLoading: state.operationLoading,
    fetchPlans,
    deletePlan,
    searchPlans,
    setFilters,
    clearFilters,
    createPlan,
    updatePlan,
    selectPlan,
  }
}

// Hook para um plano específico
export function usePlan() {
  const { state, fetchPlan, createPlan, updatePlan, selectPlan, clearError } = usePlanContext()

  return {
    selectedPlan: state.selectedPlan,
    loading: state.loading,
    operationLoading: state.operationLoading,
    error: state.error,
    fetchPlan,
    createPlan,
    updatePlan,
    selectPlan,
    clearError,
  }
}

// Hook para estatísticas
export function usePlanStats() {
  const { state, fetchStats } = usePlanContext()

  return {
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    fetchStats,
  }
}

// Hook para busca de planos
export function usePlanSearch() {
  const { state, searchPlans, setFilters, clearFilters } = usePlanContext()

  return {
    searchResults: state.searchResults,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    searchPlans,
    setFilters,
    clearFilters,
  }
}
