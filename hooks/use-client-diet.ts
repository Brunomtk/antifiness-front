"use client"

import { useCallback, useState, useEffect } from "react"
import { dietService } from "@/services/diet-service"
import { useUserContext } from "@/contexts/user-context"
import type { ApiDiet, ApiMeal, ApiDietProgress } from "@/types/diet"
import { toast } from "sonner"

export function useClientDiet() {
  const { state } = useUserContext()
  const [currentDiet, setCurrentDiet] = useState<ApiDiet | null>(null)
  const [meals, setMeals] = useState<ApiMeal[]>([])
  const [progress, setProgress] = useState<ApiDietProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar dieta ativa do cliente
  const fetchCurrentDiet = useCallback(async () => {
    if (!state.currentUser || !state.currentUser.clientId) {
      setError("Usuário não encontrado ou não é um cliente")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Buscar dietas do cliente usando o clientId do usuário logado
      const response = await dietService.getDiets({
        pageNumber: 1,
        pageSize: 10,
        clientId: state.currentUser.clientId,
        status: 1, // Status ativo
      })

      if (response.diets.length > 0) {
        // Pegar a primeira dieta ativa
        const activeDiet = response.diets.find((diet) => diet.status === 1) || response.diets[0]
        setCurrentDiet(activeDiet)
        await fetchMeals(activeDiet.id)
        await fetchProgress(activeDiet.id)
      } else {
        setCurrentDiet(null)
        setMeals([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar dieta"
      setError(errorMessage)
      console.error("Erro ao buscar dieta:", err)
    } finally {
      setLoading(false)
    }
  }, [state.currentUser])

  
  // Buscar refeições da dieta
  const fetchMeals = useCallback(async (dietId: number) => {
    try {
      const mealsData = await dietService.getDietMeals(dietId)
      setMeals(Array.isArray(mealsData) ? mealsData : [])
    } catch (err) {
      console.error("Erro ao buscar refeições:", err)
      setMeals([])
    }
  }, [])
// Buscar progresso da dieta
  const fetchProgress = useCallback(async (dietId: number) => {
    try {
      const progressData = await dietService.getDietProgress(dietId)
      setProgress(progressData)
    } catch (err) {
      console.error("Erro ao buscar progresso:", err)
    }
  }, [])

  // Marcar refeição como concluída
  
  // Marcar refeição como concluída (com validação local)
  const completeMeal = useCallback(async (mealId: number) => {
    try {
      // validar refeição existente no estado atual
      const meal = meals.find((m) => m.id === mealId)
      if (!meal) {
        toast.error("Refeição não encontrada nesta dieta.")
        throw new Error("MEAL_NOT_FOUND_LOCAL")
      }
      // validar associação com a dieta atual
      if (!currentDiet || meal.dietId !== currentDiet.id) {
        toast.error("Refeição não pertence à dieta atual.")
        throw new Error("MEAL_NOT_IN_CURRENT_DIET")
      }

      await dietService.completeMeal(mealId)

      // Atualizar estado local
      setMeals((prev) =>
        prev.map((m) =>
          m.id === mealId ? { ...m, isCompleted: true, completedAt: new Date().toISOString() } : m,
        ),
      )
      // Atualiza progresso
      try { await fetchProgress(currentDiet.id) } catch {}

      toast.success("Refeição marcada como concluída!")
    } catch (err: any) {
      const msg = err?.message || ""
      if (msg !== "MEAL_NOT_FOUND_LOCAL" && msg !== "MEAL_NOT_IN_CURRENT_DIET") {
        const errorMessage = err instanceof Error ? err.message : "Erro ao completar refeição"
        toast.error(errorMessage)
      }
      throw err
    }
  }, [meals, currentDiet, fetchProgress])


  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (state.currentUser && state.currentUser.clientId) {
      fetchCurrentDiet()
    }
  }, [fetchCurrentDiet, state.currentUser])

  // Carregar progresso quando a dieta for carregada
  useEffect(() => {
    if (currentDiet) {
      fetchProgress(currentDiet.id)
    }
  }, [currentDiet, fetchProgress])

  return {
    currentDiet,
    meals,
    progress,
    loading,
    error,
    fetchCurrentDiet,
    completeMeal,
    currentUser: state.currentUser,
  }
}
