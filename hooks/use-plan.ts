"use client"

import { useCallback } from "react"
import { usePlanContext } from "@/contexts/plan-context"
import type { Plan, CreatePlanData, UpdatePlanData } from "@/types/plan"

// Hook principal para planos
export function usePlans() {
  const {
    state,
    fetchPlans,
    deletePlan,
    searchPlans,
    setFilters,
    clearFilters,
    createPlan: createContextPlan,
    updatePlan: contextUpdatePlan,
    selectPlan: contextSelectPlan,
  } = usePlanContext()

  const createPlan = useCallback(
    async (data: CreatePlanData) => {
      return await createContextPlan(data)
    },
    [createContextPlan],
  )

  const updatePlan = useCallback(
    async (id: number, data: UpdatePlanData) => {
      await contextUpdatePlan(id, data)
    },
    [contextUpdatePlan],
  )

  const selectPlan = useCallback(
    (plan: Plan | null) => {
      contextSelectPlan(plan)
    },
    [contextSelectPlan],
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
