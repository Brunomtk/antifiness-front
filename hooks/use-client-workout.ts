"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import type { Workout, WorkoutProgress, WorkoutStats } from "@/types/workout"

interface UseClientWorkoutState {
  workouts: Workout[]
  currentWorkout: Workout | null
  progress: WorkoutProgress[]
  workoutHistory: WorkoutProgress[]
  stats: WorkoutStats | null
  loading: {
    workouts: boolean
    workout: boolean
    progress: boolean
    history: boolean
    stats: boolean
    updating: boolean
  }
  error: {
    workouts: string | null
    workout: string | null
    progress: string | null
    history: string | null
    stats: string | null
    general: string | null
  }
}

interface UseClientWorkoutActions {
  loadWorkouts: () => Promise<void>
  loadWorkout: (id: number) => Promise<void>
  loadProgress: (workoutId: number) => Promise<void>
  loadWorkoutHistory: () => Promise<void>
  loadStats: () => Promise<void>
  recordProgress: (
    workoutId: number,
    data: Omit<WorkoutProgress, "id" | "workoutId" | "workoutName" | "createdAt">,
  ) => Promise<boolean>
  updateExerciseCompletion: (
    workoutId: number,
    exerciseId: number,
    isCompleted: boolean,
    completedSets?: number,
  ) => Promise<boolean>
  clearError: (key?: keyof UseClientWorkoutState["error"]) => void
  refreshAll: () => Promise<void>
}

type UseClientWorkoutReturn = UseClientWorkoutState & UseClientWorkoutActions

export function useClientWorkout(): UseClientWorkoutReturn {
  const [state, setState] = useState<UseClientWorkoutState>({
    workouts: [],
    currentWorkout: null,
    progress: [],
    workoutHistory: [],
    stats: null,
    loading: {
      workouts: false,
      workout: false,
      progress: false,
      history: false,
      stats: false,
      updating: false,
    },
    error: {
      workouts: null,
      workout: null,
      progress: null,
      history: null,
      stats: null,
      general: null,
    },
  })

  // Buscar dados do usuário logado
  const getCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token não encontrado")

      const payload = JSON.parse(atob(token.split(".")[1]))
      const userId = payload.sub

      const response = await api.get(`/Users/${userId}`)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return null
    }
  }, [])

  const loadWorkouts = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, workouts: true },
      error: { ...prev.error, workouts: null },
    }))

    try {
      const user = await getCurrentUser()
      if (!user || !user.clientId) {
        throw new Error("Usuário não é um cliente válido")
      }

      const response = await api.get("/Workout", {
        params: {
          ClientId: user.clientId,
          IsTemplate: false,
          Page: 1,
          PageSize: 50,
          SortBy: "createdAt",
          SortOrder: "desc",
        },
      })

      setState((prev) => ({
        ...prev,
        workouts: response.data.workouts || [],
        loading: { ...prev.loading, workouts: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, workouts: false },
        error: {
          ...prev.error,
          workouts: error instanceof Error ? error.message : "Erro ao carregar treinos",
        },
      }))
    }
  }, [getCurrentUser])

  const loadWorkout = useCallback(async (id: number) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, workout: true },
      error: { ...prev.error, workout: null },
    }))

    try {
      const response = await api.get(`/Workout/${id}`)

      setState((prev) => ({
        ...prev,
        currentWorkout: response.data,
        loading: { ...prev.loading, workout: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, workout: false },
        error: {
          ...prev.error,
          workout: error instanceof Error ? error.message : "Erro ao carregar treino",
        },
      }))
    }
  }, [])

  const loadProgress = useCallback(async (workoutId: number) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, progress: true },
      error: { ...prev.error, progress: null },
    }))

    try {
      const response = await api.get(`/Workout/${workoutId}/progress`)

      setState((prev) => ({
        ...prev,
        progress: response.data || [],
        loading: { ...prev.loading, progress: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, progress: false },
        error: {
          ...prev.error,
          progress: error instanceof Error ? error.message : "Erro ao carregar progresso",
        },
      }))
    }
  }, [])

  const loadWorkoutHistory = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, history: true },
      error: { ...prev.error, history: null },
    }))

    try {
      const user = await getCurrentUser()
      if (!user || !user.clientId) {
        throw new Error("Usuário não é um cliente válido")
      }

      // Buscar histórico de progresso de todos os treinos do cliente
      const workoutsResponse = await api.get("/Workout", {
        params: {
          ClientId: user.clientId,
          IsTemplate: false,
          Page: 1,
          PageSize: 100,
        },
      })

      const workouts = workoutsResponse.data.workouts || []
      const allProgress: WorkoutProgress[] = []

      // Para cada treino, buscar seu progresso
      for (const workout of workouts) {
        try {
          const progressResponse = await api.get(`/Workout/${workout.id}/progress`)
          const workoutProgress = progressResponse.data || []

          // Adicionar nome do treino ao progresso
          const progressWithWorkoutName = workoutProgress.map((p: WorkoutProgress) => ({
            ...p,
            workoutName: workout.name,
          }))

          allProgress.push(...progressWithWorkoutName)
        } catch (error) {
          // Ignorar erros individuais de treinos
          console.warn(`Erro ao buscar progresso do treino ${workout.id}:`, error)
        }
      }

      // Ordenar por data (mais recente primeiro)
      allProgress.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setState((prev) => ({
        ...prev,
        workoutHistory: allProgress,
        loading: { ...prev.loading, history: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, history: false },
        error: {
          ...prev.error,
          history: error instanceof Error ? error.message : "Erro ao carregar histórico",
        },
      }))
    }
  }, [getCurrentUser])

  const loadStats = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, stats: true },
      error: { ...prev.error, stats: null },
    }))

    try {
      const user = await getCurrentUser()
      if (!user || !user.clientId) {
        throw new Error("Usuário não é um cliente válido")
      }

      const response = await api.get("/Workout/stats", {
        params: {
          clientId: user.clientId,
          empresaId: user.empresaId,
        },
      })

      setState((prev) => ({
        ...prev,
        stats: response.data,
        loading: { ...prev.loading, stats: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, stats: false },
        error: {
          ...prev.error,
          stats: error instanceof Error ? error.message : "Erro ao carregar estatísticas",
        },
      }))
    }
  }, [getCurrentUser])

  const recordProgress = useCallback(
    async (
      workoutId: number,
      data: Omit<WorkoutProgress, "id" | "workoutId" | "workoutName" | "createdAt">,
    ): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, updating: true },
        error: { ...prev.error, general: null },
      }))

      try {
        const user = await getCurrentUser();
        const progressPayload: any = { ...data };
        if (user?.clientId != null) {
          progressPayload.clientId = Number(user.clientId);
        } else {
          delete progressPayload.clientId;
        }
        // remove undefined/nulls to satisfy strict model binding
        Object.keys(progressPayload).forEach((k) => (progressPayload[k] == null ? delete progressPayload[k] : null));
        await api.post(`/Workout/${workoutId}/progress`, progressPayload)

        // Recarregar progresso e histórico após salvar
        await Promise.all([loadProgress(workoutId), loadWorkoutHistory()])

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, updating: false },
        }))

        return true
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, updating: false },
          error: {
            ...prev.error,
            general: error instanceof Error ? error.message : "Erro ao registrar progresso",
          },
        }))
        return false
      }
    },
    [loadProgress, loadWorkoutHistory],
  )

  const updateExerciseCompletion = useCallback(
    async (workoutId: number, exerciseId: number, isCompleted: boolean, completedSets?: number): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, updating: true },
        error: { ...prev.error, general: null },
      }))

      try {
        // Buscar o workout atual para atualizar
        const workoutResponse = await api.get(`/Workout/${workoutId}`)
        const workout = workoutResponse.data

        // Atualizar o exercício específico
        const updatedExercises = workout.exercises.map((ex: any) => {
          const matches = (ex.id && ex.id === exerciseId) || ex.exerciseId === exerciseId;
          if (matches) {
            return {
              ...ex,
              isCompleted,
              completedSets: completedSets || ex.completedSets,
            }
          }
          return ex
        })

        // Atualizar o workout
        const user = await getCurrentUser();
        const sanitized = {
          id: workout.id,
          clientId: user?.clientId != null ? Number(user.clientId) : undefined,
          name: workout.name,
          description: workout.description ?? '',
          isTemplate: workout.isTemplate ?? false,
          exercises: updatedExercises.map((ex: any) => ({
            id: ex.id,
            exerciseId: ex.exerciseId,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restTime: ex.restTime,
            notes: ex.notes,
            isCompleted: !!ex.isCompleted,
            completedSets: ex.completedSets ?? 0,
          })),
        } as any;
        // drop undefined fields (clientId, optional)
        Object.keys(sanitized).forEach((k) => (sanitized[k] == null ? delete sanitized[k] : null));
        await api.put(`/Workout/${workoutId}`, { request: sanitized })

        // Recarregar o workout
        await loadWorkout(workoutId)

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, updating: false },
        }))

        return true
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, updating: false },
          error: {
            ...prev.error,
            general: error instanceof Error ? error.message : "Erro ao atualizar exercício",
          },
        }))
        return false
      }
    },
    [loadWorkout],
  )

  const clearError = useCallback((key?: keyof UseClientWorkoutState["error"]) => {
    setState((prev) => ({
      ...prev,
      error: key
        ? { ...prev.error, [key]: null }
        : { workouts: null, workout: null, progress: null, history: null, stats: null, general: null },
    }))
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([loadWorkouts(), loadStats(), loadWorkoutHistory()])
  }, [loadWorkouts, loadStats, loadWorkoutHistory])

  // Carregar dados iniciais
  useEffect(() => {
    loadWorkouts()
    loadStats()
    loadWorkoutHistory()
  }, [loadWorkouts, loadStats, loadWorkoutHistory])

  return {
    ...state,
    loadWorkouts,
    loadWorkout,
    loadProgress,
    loadWorkoutHistory,
    loadStats,
    recordProgress,
    updateExerciseCompletion,
    clearError,
    refreshAll,
  }
}
