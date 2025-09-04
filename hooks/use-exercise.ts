"use client"

import { useState, useEffect, useCallback } from "react"
import { exerciseService } from "@/services/exercise-service"
import {
  type Exercise,
  type CreateExerciseData,
  type UpdateExerciseData,
  type ExerciseFilters,
  type ExerciseListResponse,
  validateExercise,
} from "@/services/exercise-service"

interface UseExerciseListState {
  exercises: Exercise[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  loading: {
    exercises: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }
  error: {
    exercises: string | null
    general: string | null
  }
  filters: ExerciseFilters
}

interface UseExerciseListActions {
  updateFilters: (newFilters: Partial<ExerciseFilters>) => void
  resetFilters: () => void
  createExercise: (data: CreateExerciseData) => Promise<Exercise | null>
  updateExercise: (id: number, data: UpdateExerciseData) => Promise<Exercise | null>
  deleteExercise: (id: number) => Promise<boolean>
  duplicateExercise: (exercise: Exercise) => Promise<Exercise | null>
  clearError: (key?: keyof UseExerciseListState["error"]) => void
  refreshExercises: () => Promise<void>
  fetchExercises: () => Promise<void>
}

type UseExerciseListReturn = UseExerciseListState & UseExerciseListActions

export function useExercise(initialFilters: ExerciseFilters = {}): UseExerciseListReturn {
  const [state, setState] = useState<UseExerciseListState>({
    exercises: [],
    pagination: {
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    loading: {
      exercises: false,
      creating: false,
      updating: false,
      deleting: false,
    },
    error: {
      exercises: null,
      general: null,
    },
    filters: { page: 1, pageSize: 10, ...initialFilters },
  })

  const fetchExercises = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, exercises: true },
      error: { ...prev.error, exercises: null },
    }))

    try {
      const response: ExerciseListResponse = await exerciseService.getExercises(state.filters)

      setState((prev) => ({
        ...prev,
        exercises: response.exercises || [],
        pagination: {
          page: response.page || 1,
          pageSize: response.pageSize || 10,
          totalCount: response.totalCount || 0,
          totalPages: response.totalPages || 0,
          hasNextPage: response.hasNextPage || false,
          hasPreviousPage: response.hasPreviousPage || false,
        },
        loading: { ...prev.loading, exercises: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, exercises: false },
        error: { ...prev.error, exercises: error instanceof Error ? error.message : "Erro ao carregar exercícios" },
      }))
    }
  }, []) // Remover state.filters da dependência

  const updateFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: { page: 1, pageSize: 10, ...initialFilters },
    }))
  }, [initialFilters])

  const createExercise = useCallback(async (data: CreateExerciseData): Promise<Exercise | null> => {
    const errors = validateExercise(data)
    if (errors.length > 0) {
      setState((prev) => ({
        ...prev,
        error: { ...prev.error, general: errors.join(", ") },
      }))
      return null
    }

    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, creating: true },
      error: { ...prev.error, general: null },
    }))

    try {
      const exercise = await exerciseService.createExercise(data)

      setState((prev) => ({
        ...prev,
        exercises: [exercise, ...prev.exercises],
        pagination: {
          ...prev.pagination,
          totalCount: prev.pagination.totalCount + 1,
        },
        loading: { ...prev.loading, creating: false },
      }))

      return exercise
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, creating: false },
        error: { ...prev.error, general: error instanceof Error ? error.message : "Erro ao criar exercício" },
      }))
      return null
    }
  }, [])

  const updateExercise = useCallback(async (id: number, data: UpdateExerciseData): Promise<Exercise | null> => {
    const errors = validateExercise(data)
    if (errors.length > 0) {
      setState((prev) => ({
        ...prev,
        error: { ...prev.error, general: errors.join(", ") },
      }))
      return null
    }

    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, updating: true },
      error: { ...prev.error, general: null },
    }))

    try {
      const exercise = await exerciseService.updateExercise(id, data)

      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) => (ex.id === id ? exercise : ex)),
        loading: { ...prev.loading, updating: false },
      }))

      return exercise
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, updating: false },
        error: { ...prev.error, general: error instanceof Error ? error.message : "Erro ao atualizar exercício" },
      }))
      return null
    }
  }, [])

  const deleteExercise = useCallback(async (id: number): Promise<boolean> => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, deleting: true },
      error: { ...prev.error, general: null },
    }))

    try {
      await exerciseService.deleteExercise(id)

      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.filter((ex) => ex.id !== id),
        pagination: {
          ...prev.pagination,
          totalCount: Math.max(0, prev.pagination.totalCount - 1),
        },
        loading: { ...prev.loading, deleting: false },
      }))

      return true
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, deleting: false },
        error: { ...prev.error, general: error instanceof Error ? error.message : "Erro ao excluir exercício" },
      }))
      return false
    }
  }, [])

  const duplicateExercise = useCallback(
    async (exercise: Exercise): Promise<Exercise | null> => {
      const duplicateData: CreateExerciseData = {
        name: `${exercise.name} (Cópia)`,
        description: exercise.description,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        instructions: exercise.instructions,
        tips: exercise.tips,
        warnings: exercise.warnings,
        videoUrl: exercise.videoUrl,
        imageUrl: exercise.imageUrl,
        isActive: exercise.isActive,
        empresaId: exercise.empresaId,
      }

      return await createExercise(duplicateData)
    },
    [createExercise],
  )

  const clearError = useCallback((key?: keyof UseExerciseListState["error"]) => {
    setState((prev) => ({
      ...prev,
      error: key ? { ...prev.error, [key]: null } : { exercises: null, general: null },
    }))
  }, [])

  const refreshExercises = useCallback(async () => {
    await fetchExercises()
  }, [fetchExercises])

  // Usar useEffect separado para reagir às mudanças de filtros
  useEffect(() => {
    const loadExercises = async () => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, exercises: true },
        error: { ...prev.error, exercises: null },
      }))

      try {
        const response: ExerciseListResponse = await exerciseService.getExercises(state.filters)

        setState((prev) => ({
          ...prev,
          exercises: response.exercises || [],
          pagination: {
            page: response.page || 1,
            pageSize: response.pageSize || 10,
            totalCount: response.totalCount || 0,
            totalPages: response.totalPages || 0,
            hasNextPage: response.hasNextPage || false,
            hasPreviousPage: response.hasPreviousPage || false,
          },
          loading: { ...prev.loading, exercises: false },
        }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, exercises: false },
          error: { ...prev.error, exercises: error instanceof Error ? error.message : "Erro ao carregar exercícios" },
        }))
      }
    }

    loadExercises()
  }, [state.filters])

  return {
    ...state,
    updateFilters,
    resetFilters,
    createExercise,
    updateExercise,
    deleteExercise,
    duplicateExercise,
    clearError,
    refreshExercises,
    fetchExercises,
  }
}

// Hook para exercício individual
export function useExerciseById(id: number) {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadExercise = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const data = await exerciseService.getExerciseById(id)
      setExercise(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao carregar exercício")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadExercise()
  }, [loadExercise])

  return { exercise, loading, error, reload: loadExercise }
}
