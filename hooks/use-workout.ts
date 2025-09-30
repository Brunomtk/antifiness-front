"use client"

import { useState, useEffect, useCallback } from "react"
import { workoutService, validateWorkout, validateWorkoutProgress } from "@/services/workout-service"
import type {
  Workout,
  CreateWorkoutRequest as CreateWorkoutData,
  UpdateWorkoutRequest as UpdateWorkoutData,
  WorkoutProgress,
  WorkoutStats,
  WorkoutsQuery as WorkoutFilters,
  WorkoutsPage as WorkoutListResponse,
} from "@/types/workout"

interface UseWorkoutListState {
  workouts: Workout[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  loading: {
    workouts: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }
  error: {
    workouts: string | null
    general: string | null
  }
  filters: WorkoutFilters
}

interface UseWorkoutListActions {
  updateFilters: (newFilters: Partial<WorkoutFilters>) => void
  resetFilters: () => void
  createWorkout: (data: CreateWorkoutData) => Promise<Workout | null>
  updateWorkout: (id: number, data: UpdateWorkoutData) => Promise<Workout | null>
  deleteWorkout: (id: number) => Promise<boolean>
  updateWorkoutStatus: (id: number, status: number) => Promise<boolean>
  duplicateWorkout: (workout: Workout) => Promise<Workout | null>
  clearError: (key?: keyof UseWorkoutListState["error"]) => void
  refreshWorkouts: () => Promise<void>
}

type UseWorkoutListReturn = UseWorkoutListState & UseWorkoutListActions

export function useWorkoutList(initialFilters: WorkoutFilters = {}): UseWorkoutListReturn {
  const [state, setState] = useState<UseWorkoutListState>({
    workouts: [],
    pagination: {
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    loading: {
      workouts: false,
      creating: false,
      updating: false,
      deleting: false,
    },
    error: {
      workouts: null,
      general: null,
    },
    filters: { page: 1, pageSize: 10, ...initialFilters },
  })

  const fetchWorkouts = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, workouts: true },
      error: { ...prev.error, workouts: null },
    }))

    try {
      const response: WorkoutListResponse = await workoutService.getPaged(state.filters)

      setState((prev) => ({
        ...prev,
        workouts: response.workouts || [],
        pagination: {
          page: response.page || 1,
          pageSize: response.pageSize || 10,
          totalCount: response.totalCount || 0,
          totalPages: response.totalPages || 0,
          hasNextPage: response.hasNextPage || false,
          hasPreviousPage: response.hasPreviousPage || false,
        },
        loading: { ...prev.loading, workouts: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, workouts: false },
        error: { ...prev.error, workouts: error instanceof Error ? error.message : "Erro ao carregar treinos" },
      }))
    }
  }, [state.filters])

  const updateFilters = useCallback((newFilters: Partial<WorkoutFilters>) => {
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

  const createWorkout = useCallback(async (data: CreateWorkoutData): Promise<Workout | null> => {
    if (!validateWorkout(data)) {
      setState((prev) => ({
        ...prev,
        error: { ...prev.error, general: "Dados do treino inválidos" },
      }))
      return null
    }

    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, creating: true },
      error: { ...prev.error, general: null },
    }))

    try {
      const workout = await workoutService.create(data)

      setState((prev) => ({
        ...prev,
        workouts: [workout, ...prev.workouts],
        pagination: {
          ...prev.pagination,
          totalCount: prev.pagination.totalCount + 1,
        },
        loading: { ...prev.loading, creating: false },
      }))

      return workout
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, creating: false },
        error: { ...prev.error, general: error instanceof Error ? error.message : "Erro ao criar treino" },
      }))
      return null
    }
  }, [])

  const updateWorkout = useCallback(async (id: number, data: UpdateWorkoutData): Promise<Workout | null> => {
    if (!validateWorkout(data)) {
      setState((prev) => ({
        ...prev,
        error: { ...prev.error, general: "Dados do treino inválidos" },
      }))
      return null
    }

    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, updating: true },
      error: { ...prev.error, general: null },
    }))

    try {
      const workout = await workoutService.update(id, data)

      setState((prev) => ({
        ...prev,
        workouts: prev.workouts.map((w) => (w.id === id ? workout : w)),
        loading: { ...prev.loading, updating: false },
      }))

      return workout
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, updating: false },
        error: { ...prev.error, general: error instanceof Error ? error.message : "Erro ao atualizar treino" },
      }))
      return null
    }
  }, [])

  const deleteWorkout = useCallback(async (id: number): Promise<boolean> => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, deleting: true },
      error: { ...prev.error, general: null },
    }))

    try {
      await workoutService.remove(id)

      setState((prev) => ({
        ...prev,
        workouts: prev.workouts.filter((w) => w.id !== id),
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
        error: { ...prev.error, general: error instanceof Error ? error.message : "Erro ao excluir treino" },
      }))
      return false
    }
  }, [])

  const updateWorkoutStatus = useCallback(async (id: number, status: number): Promise<boolean> => {
    setState((prev) => ({
      ...prev,
      error: { ...prev.error, general: null },
    }))

    try {
      await workoutService.changeStatus(id, status)

      setState((prev) => ({
        ...prev,
        workouts: prev.workouts.map((w) => (w.id === id ? { ...w, status } : w)),
      }))

      return true
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: { ...prev.error, general: error instanceof Error ? error.message : "Erro ao atualizar status" },
      }))
      return false
    }
  }, [])

  const duplicateWorkout = useCallback(
    async (workout: Workout): Promise<Workout | null> => {
      const duplicateData: CreateWorkoutData = {
        name: `${workout.name} (Cópia)`,
        description: workout.description,
        type: workout.type,
        difficulty: workout.difficulty,
        estimatedDuration: workout.estimatedDuration,
        estimatedCalories: workout.estimatedCalories,
        tags: workout.tags ? [...workout.tags] : [],
        isTemplate: false,
        notes: workout.notes,
        empresaId: workout.empresaId,
        clientId: workout.clientId,
        exercises: workout.exercises?.map((ex) => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.restTime,
          notes: ex.notes,
        })),
      }

      return await createWorkout(duplicateData)
    },
    [createWorkout],
  )

  const clearError = useCallback((key?: keyof UseWorkoutListState["error"]) => {
    setState((prev) => ({
      ...prev,
      error: key ? { ...prev.error, [key]: null } : { workouts: null, general: null },
    }))
  }, [])

  const refreshWorkouts = useCallback(async () => {
    await fetchWorkouts()
  }, [fetchWorkouts])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  return {
    ...state,
    updateFilters,
    resetFilters,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    updateWorkoutStatus,
    duplicateWorkout,
    clearError,
    refreshWorkouts,
  }
}

// Hook para treino individual
export function useWorkout(id: number) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadWorkout = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const data = await workoutService.getById(id)
      setWorkout(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao carregar treino")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadWorkout()
  }, [loadWorkout])

  return { workout, loading, error, reload: loadWorkout }
}

// Hook para templates
export function useWorkoutTemplates(filters: WorkoutFilters = {}) {
  const [templates, setTemplates] = useState<Workout[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await workoutService.getTemplates(filters)
      setTemplates(response.workouts || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao carregar templates")
    } finally {
      setLoading(false)
    }
  }, [filters])

  const instantiateTemplate = useCallback(
    async (templateId: number, data: CreateWorkoutData): Promise<Workout | null> => {
      if (!validateWorkout(data)) {
        setError("Dados do template inválidos")
        return null
      }

      try {
        return await workoutService.instantiateTemplate(templateId, data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro ao instanciar template")
        return null
      }
    },
    [],
  )

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  return { templates, loading, error, instantiateTemplate, reload: loadTemplates }
}

// Hook para progresso
export function useWorkoutProgress(workoutId: number) {
  const [progress, setProgress] = useState<WorkoutProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProgress = useCallback(async () => {
    if (!workoutId) return

    setLoading(true)
    setError(null)

    try {
      const data = await workoutService.getProgress(workoutId)
      setProgress(data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao carregar progresso")
    } finally {
      setLoading(false)
    }
  }, [workoutId])

  const recordProgress = useCallback(
    async (data: WorkoutProgress): Promise<WorkoutProgress | null> => {
      if (!validateWorkoutProgress(data)) {
        setError("Dados do progresso inválidos")
        return null
      }

      try {
        const result = await workoutService.addProgress(workoutId, data)
        await loadProgress() // Recarrega o progresso
        return result
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erro ao registrar progresso")
        return null
      }
    },
    [workoutId, loadProgress],
  )

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  return { progress, loading, error, recordProgress, reload: loadProgress }
}

// Hook para estatísticas
export function useWorkoutStats(empresaId?: number, clientId?: number) {
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await workoutService.getStats({ empresaId, clientId })
      setStats(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao carregar estatísticas")
    } finally {
      setLoading(false)
    }
  }, [empresaId, clientId])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return { stats, loading, error, reload: loadStats }
}
