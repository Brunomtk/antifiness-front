"use client"

import { useCallback, useState } from "react"
import { foodService, type FoodFilters, type CreateFoodRequest, type UpdateFoodRequest } from "@/services/food-service"
import type { ApiFood } from "@/types/food"
import { toast } from "sonner"

export function useFoods() {
  const [foods, setFoods] = useState<ApiFood[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFoods = useCallback(async (filters: FoodFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await foodService.getFoods(filters)
      setFoods(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar alimentos"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getFoodById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const food = await foodService.getFoodById(id)
      return food
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar alimento"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createFood = useCallback(async (data: CreateFoodRequest) => {
    setCreating(true)
    setError(null)

    try {
      const newFood = await foodService.createFood(data)
      setFoods((prev) => [newFood, ...prev])
      toast.success("Alimento criado com sucesso!")
      return newFood
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar alimento"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  const updateFood = useCallback(async (id: number, data: UpdateFoodRequest) => {
    setUpdating(true)
    setError(null)

    try {
      const updatedFood = await foodService.updateFood(id, data)
      setFoods((prev) => prev.map((food) => (food.id === id ? updatedFood : food)))
      toast.success("Alimento atualizado com sucesso!")
      return updatedFood
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar alimento"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  const deleteFood = useCallback(async (id: number) => {
    setDeleting(true)
    setError(null)

    try {
      await foodService.deleteFood(id)
      setFoods((prev) => prev.filter((food) => food.id !== id))
      toast.success("Alimento excluído com sucesso!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir alimento"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setDeleting(false)
    }
  }, [])

  const searchFoods = useCallback(async (query: string, category?: number) => {
    setLoading(true)
    setError(null)

    try {
      const results = await foodService.searchFoods(query, category)
      setFoods(results)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar alimentos"
      setError(errorMessage)
      toast.error(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getFoodsByCategory = useCallback(async (category: number) => {
    setLoading(true)
    setError(null)

    try {
      const results = await foodService.getFoodsByCategory(category)
      setFoods(results)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar alimentos por categoria"
      setError(errorMessage)
      toast.error(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getActiveFoods = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const results = await foodService.getActiveFoods()
      setFoods(results)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar alimentos ativos"
      setError(errorMessage)
      toast.error(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    foods,
    loading,
    creating,
    updating,
    deleting,
    error,
    fetchFoods,
    getFoodById,
    createFood,
    updateFood,
    deleteFood,
    searchFoods,
    getFoodsByCategory,
    getActiveFoods,
  }
}

// Hook para busca de alimentos com debounce
export function useFoodSearch() {
  const [searchResults, setSearchResults] = useState<ApiFood[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchFoods = useCallback(async (query: string, category?: number) => {
    if (!query.trim()) {
      setSearchResults([])
      return []
    }

    setSearching(true)
    setSearchError(null)

    try {
      const results = await foodService.searchFoods(query, category)
      setSearchResults(results)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar alimentos"
      setSearchError(errorMessage)
      return []
    } finally {
      setSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setSearchError(null)
  }, [])

  return {
    searchResults,
    searching,
    searchError,
    searchFoods,
    clearSearch,
  }
}
