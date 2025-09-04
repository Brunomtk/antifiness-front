"use client"

import { useCallback, useState } from "react"
import {
  dietService,
  type DietFilters,
  type CreateDietRequest,
  type CreateMealRequest,
  type CreateProgressRequest,
} from "@/services/diet-service"
import type { ApiDiet, ApiMeal, ApiDietProgress, ApiDietStats } from "@/types/diet"
import { toast } from "sonner"

export function useDiets() {
  const [diets, setDiets] = useState<ApiDiet[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  })

  const fetchDiets = useCallback(async (filters: DietFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await dietService.getDiets({
        pageNumber: 1,
        pageSize: 20,
        empresaId: 1, // Default empresa
        ...filters,
      })

      setDiets(response.diets)
      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dietas"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getDietById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const diet = await dietService.getDietById(id)
      return diet
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dieta"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createDiet = useCallback(async (data: Omit<CreateDietRequest, "empresaId">) => {
    setCreating(true)
    setError(null)

    try {
      const newDiet = await dietService.createDiet({
        ...data,
        empresaId: 1, // Default empresa
      })

      setDiets((prev) => [newDiet, ...prev])
      toast.success("Dieta criada com sucesso!")
      return newDiet
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar dieta"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  const updateDiet = useCallback(async (id: number, data: Omit<CreateDietRequest, "empresaId">) => {
    setUpdating(true)
    setError(null)

    try {
      const updatedDiet = await dietService.updateDiet(id, {
        ...data,
        empresaId: 1, // Default empresa
      })

      setDiets((prev) => prev.map((diet) => (diet.id === id ? updatedDiet : diet)))
      toast.success("Dieta atualizada com sucesso!")
      return updatedDiet
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar dieta"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  const deleteDiet = useCallback(async (id: number) => {
    setDeleting(true)
    setError(null)

    try {
      await dietService.deleteDiet(id)
      setDiets((prev) => prev.filter((diet) => diet.id !== id))
      toast.success("Dieta excluída com sucesso!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir dieta"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setDeleting(false)
    }
  }, [])

  return {
    diets,
    loading,
    creating,
    updating,
    deleting,
    error,
    pagination,
    fetchDiets,
    getDietById,
    createDiet,
    updateDiet,
    deleteDiet,
  }
}

export function useDietStats() {
  const [stats, setStats] = useState<ApiDietStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const statsData = await dietService.getDietStats()
      setStats(statsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar estatísticas"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
}

export function useDietMeals() {
  const [meals, setMeals] = useState<ApiMeal[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeals = useCallback(async (dietId: number) => {
    setLoading(true)
    setError(null)

    try {
      const mealsData = await dietService.getDietMeals(dietId)
      setMeals(mealsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar refeições"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createMeal = useCallback(async (dietId: number, data: CreateMealRequest) => {
    setCreating(true)
    setError(null)

    try {
      const newMeal = await dietService.createMeal(dietId, data)
      setMeals((prev) => [...prev, newMeal])
      toast.success("Refeição criada com sucesso!")
      return newMeal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar refeição"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  const updateMeal = useCallback(async (mealId: number, data: CreateMealRequest) => {
    setUpdating(true)
    setError(null)

    try {
      await dietService.updateMeal(mealId, data)
      setMeals((prev) => prev.map((meal) => (meal.id === mealId ? { ...meal, ...data } : meal)))
      toast.success("Refeição atualizada com sucesso!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar refeição"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  const deleteMeal = useCallback(async (mealId: number) => {
    setDeleting(true)
    setError(null)

    try {
      await dietService.deleteMeal(mealId)
      setMeals((prev) => prev.filter((meal) => meal.id !== mealId))
      toast.success("Refeição excluída com sucesso!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir refeição"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setDeleting(false)
    }
  }, [])

  
  const completeMeal = useCallback(async (mealId: number) => {
    setUpdating(true)
    setError(null)

    try {
      const meal = meals.find((m) => m.id === mealId)
      if (!meal) {
        setError("Refeição não encontrada nesta dieta.")
        toast.error("Refeição não encontrada nesta dieta.")
        throw new Error("MEAL_NOT_FOUND_LOCAL")
      }
      if (!diet || meal.dietId !== diet.id) {
        setError("Refeição não pertence à dieta atual.")
        toast.error("Refeição não pertence à dieta atual.")
        throw new Error("MEAL_NOT_IN_CURRENT_DIET")
      }

      await dietService.completeMeal(mealId)
      setMeals((prev) =>
        prev.map((m) => (m.id === mealId ? { ...m, isCompleted: true, completedAt: new Date().toISOString() } : m)),
      )
      toast.success("Refeição marcada como concluída!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao completar refeição"
      setError(errorMessage)
      if (errorMessage !== "MEAL_NOT_FOUND_LOCAL" && errorMessage !== "MEAL_NOT_IN_CURRENT_DIET") {
        toast.error(errorMessage)
      }
      throw err
    } finally {
      setUpdating(false)
    }
  }, [meals])


  return {
    meals,
    loading,
    creating,
    updating,
    deleting,
    error,
    fetchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
    completeMeal,
  }
}

export function useDietProgress() {
  const [progress, setProgress] = useState<ApiDietProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async (dietId: number) => {
    setLoading(true)
    setError(null)

    try {
      const progressData = await dietService.getDietProgress(dietId)
      setProgress(progressData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar progresso"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const addProgress = useCallback(async (dietId: number, data: CreateProgressRequest) => {
    setCreating(true)
    setError(null)

    try {
      const newProgress = await dietService.createProgress(dietId, data)
      setProgress((prev) => [newProgress, ...prev])
      toast.success("Progresso adicionado com sucesso!")
      return newProgress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao adicionar progresso"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  return {
    progress,
    loading,
    creating,
    error,
    fetchProgress,
    addProgress,
  }
}
