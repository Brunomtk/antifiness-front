"use client"

import { api } from "@/lib/api"
import type {
  Workout as UIWorkout,
  WorkoutsQuery as UIWorkoutsQuery,
  CreateWorkoutRequest as UICreateWorkoutRequest,
} from "@/types/workout"

// Local enums to help with over-the-wire numbers
export type WorkoutDifficulty = 1 | 2 | 3
export type WorkoutType = 1 | 2 | 3
export type WorkoutStatus = 1 | 2

// Reuse Workout from UI types
export type Workout = UIWorkout

// Page shape used by screens
export type WorkoutsPage = {
  items: Workout[]
  totalPages: number
  page?: number
  pageSize?: number
  total?: number
}

// Query accepted by service (compatible with UI and backend)
export type WorkoutsQuery = UIWorkoutsQuery & {
  status?: (WorkoutStatus | number)[]
}

// Create/update payloads (accept enum or number)
export type CreateWorkoutRequest = UICreateWorkoutRequest & {
  type?: WorkoutType | number
  difficulty?: WorkoutDifficulty | number
}
export type UpdateWorkoutRequest = CreateWorkoutRequest

// Validators used by hooks
export const validateWorkout = (data: any): boolean => {
  if (!data) return false
  const hasName = typeof data.name === "string" && data.name.trim().length > 0
  const validType = [1, 2, 3].includes(Number(data.type))
  const validDifficulty = [1, 2, 3].includes(Number(data.difficulty))
  const isArray = Array.isArray(data.exercises)
  if (!hasName || !validType || !validDifficulty || !isArray) return false
  for (const e of data.exercises) {
    if (!e || typeof e.exerciseId !== "number") return false
    if (Number(e.sets ?? 0) < 0) return false
    if (Number(e.reps ?? 0) < 0) return false
    if (Number(e.restTime ?? 0) < 0) return false
  }
  return true
}

export const validateWorkoutProgress = (data: any): boolean => {
  if (!data) return false
  if (data.duration != null && Number.isNaN(Number(data.duration))) return false
  if (data.calories != null && Number.isNaN(Number(data.calories))) return false
  if (data.exercises && !Array.isArray(data.exercises)) return false
  return true
}

const base = "/Workout"

export const workoutService = {
  async getPaged(params?: WorkoutsQuery): Promise<WorkoutsPage> {
    const { data } = await api.get(`${base}`, { params })
    const items = data.items ?? data.workouts ?? data.data ?? data.results ?? []
    const pageSize = params?.pageSize ?? data.pageSize ?? items.length
    const total = data.total ?? data.count ?? items.length
    const totalPages = data.totalPages ?? (pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1)
    return { items, totalPages, page: data.page ?? data.currentPage ?? params?.page ?? 1, pageSize, total }
  },

  async getTemplates(params?: WorkoutsQuery): Promise<WorkoutsPage> {
    try {
      const { data } = await api.get(`${base}/templates`, { params })
      const items = data.items ?? data.workouts ?? data.data ?? data.results ?? []
      const pageSize = params?.pageSize ?? data.pageSize ?? items.length
      const total = data.total ?? data.count ?? items.length
      const totalPages = data.totalPages ?? (pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1)
      return { items, totalPages, page: data.page ?? data.currentPage ?? params?.page ?? 1, pageSize, total }
    } catch {
      const query = { ...(params || {}), isTemplate: true }
      const { data } = await api.get(`${base}`, { params: query })
      const items = data.items ?? data.workouts ?? data.data ?? data.results ?? []
      const pageSize = query.pageSize ?? data.pageSize ?? items.length
      const total = data.total ?? data.count ?? items.length
      const totalPages = data.totalPages ?? (pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1)
      return { items, totalPages, page: data.page ?? data.currentPage ?? query.page ?? 1, pageSize, total }
    }
  },

  async getStats(params?: { empresaId?: number; clientId?: number }): Promise<any> {
    // Try dedicated stats endpoints first
    try {
      const { data } = await api.get(`${base}/stats`, { params })
      const items = data.items ?? data.workouts ?? data.data ?? data.results
      const normalized = items ? null : data
      if (!items && normalized) {
        return {
          totalWorkouts: Number(normalized.totalWorkouts ?? normalized.total ?? normalized.count ?? 0),
          templateWorkouts: Number(
            normalized.templateWorkouts ?? normalized.templates ?? normalized.templateCount ?? 0,
          ),
          completedWorkouts: Number(normalized.completedWorkouts ?? normalized.completed ?? 0),
          totalExercises: Number(normalized.totalExercises ?? normalized.exercises ?? 0),
          averageRating: Number(normalized.averageRating ?? normalized.avgRating ?? 0),
          completionRate: Number(normalized.completionRate ?? normalized.completion ?? 0),
        }
      }
      // If the endpoint returned a list instead of aggregate, fall through to compute
    } catch {}
    try {
      const query: any = { ...(params || {}), page: 1, pageSize: 1000 }
      const { data } = await api.get(`${base}`, { params: query })
      const items: any[] = data.items ?? data.workouts ?? data.data ?? data.results ?? []
      const totalWorkouts = items.length
      const templateWorkouts = items.filter((w) => !!w.isTemplate).length
      const completedWorkouts = items.filter((w) => Number(w.status) === 2).length
      const totalExercises = items.reduce((acc, w) => acc + ((w.exercises && w.exercises.length) || 0), 0)
      const completionRate = totalWorkouts ? (completedWorkouts / totalWorkouts) * 100 : 0
      const averageRating = Number(data.averageRating ?? 0)
      return {
        totalWorkouts,
        templateWorkouts,
        completedWorkouts,
        totalExercises,
        averageRating,
        completionRate,
      }
    } catch {
      return {
        totalWorkouts: 0,
        templateWorkouts: 0,
        completedWorkouts: 0,
        totalExercises: 0,
        averageRating: 0,
        completionRate: 0,
      }
    }
  },

  async getById(id: number): Promise<Workout> {
    const { data } = await api.get<Workout>(`${base}/${id}`)
    return data
  },

  async create(payload: CreateWorkoutRequest): Promise<Workout> {
    const body = {
      ...payload,
      type: Number(payload.type ?? 1),
      difficulty: Number(payload.difficulty ?? 1),
      estimatedDuration: Number(payload.estimatedDuration ?? 0),
      estimatedCalories: Number(payload.estimatedCalories ?? 0),
      clientId: payload.clientId ?? 0,
      exercises: (payload.exercises || []).map((e: any) => ({
        id: Number(e.id ?? 0),
        exerciseId: Number(e.exerciseId),
        order: Number(e.order ?? 0),
        sets: Number(e.sets ?? 0),
        reps: Number(e.reps ?? 0),
        weight: Number(e.weight ?? 0),
        restTime: Number(e.restTime ?? 0),
        notes: e.notes ?? "",
      })),
    }
    const { data } = await api.post<Workout>(`${base}`, body, {
      headers: { "Content-Type": "application/json" },
    })
    return data
  },

  async update(id: number, payload: UpdateWorkoutRequest): Promise<Workout> {
    const body = {
      ...payload,
      type: Number(payload.type ?? 1),
      difficulty: Number(payload.difficulty ?? 1),
      estimatedDuration: Number(payload.estimatedDuration ?? 0),
      estimatedCalories: Number(payload.estimatedCalories ?? 0),
      clientId: payload.clientId ?? 0,
      exercises: (payload.exercises || []).map((e: any) => ({
        id: Number(e.id ?? 0),
        exerciseId: Number(e.exerciseId),
        order: Number(e.order ?? 0),
        sets: Number(e.sets ?? 0),
        reps: Number(e.reps ?? 0),
        weight: Number(e.weight ?? 0),
        restTime: Number(e.restTime ?? 0),
        notes: e.notes ?? "",
      })),
    }
    const { data } = await api.put<Workout>(`${base}/${id}`, body, {
      headers: { "Content-Type": "application/json" },
    })
    return data
  },

  async updateSafe(id: number, payload: UpdateWorkoutRequest): Promise<Workout> {
    const emptyFirst = { ...payload, exercises: [] }
    await api.put(`${base}/${id}`, {
      ...emptyFirst,
      type: Number(payload.type ?? 1),
      difficulty: Number(payload.difficulty ?? 1),
      estimatedDuration: Number(payload.estimatedDuration ?? 0),
      estimatedCalories: Number(payload.estimatedCalories ?? 0),
      clientId: payload.clientId ?? 0,
    })
    return this.update(id, payload)
  },

  async changeStatus(id: number, status: WorkoutStatus | number): Promise<Workout> {
    const statusVal = Number(status)
    try {
      const { data } = await api.put<Workout>(`${base}/${id}/status/${statusVal}`)
      return data
    } catch {
      try {
        const { data } = await api.patch<Workout>(`${base}/${id}`, { status: statusVal })
        return data
      } catch {
        const current = await this.getById(id)
        const body: any = {
          name: current.name,
          description: current.description ?? "",
          type: current.type,
          difficulty: current.difficulty,
          estimatedDuration: Number(current.estimatedDuration ?? 0),
          estimatedCalories: Number(current.estimatedCalories ?? 0),
          tags: current.tags ?? [],
          isTemplate: !!current.isTemplate,
          notes: current.notes ?? "",
          clientId: Number(current.clientId ?? 0),
          status: statusVal,
          exercises: (current.exercises || []).map((e: any) => ({
            id: Number(e.id ?? 0),
            exerciseId: Number(e.exerciseId),
            order: Number(e.order ?? 0),
            sets: Number(e.sets ?? 0),
            reps: Number(e.reps ?? 0),
            weight: Number(e.weight ?? 0),
            restTime: Number(e.restTime ?? 0),
            notes: e.notes ?? "",
          })),
        }
        const { data } = await api.put<Workout>(`${base}/${id}`, body, {
          headers: { "Content-Type": "application/json" },
        })
        return data
      }
    }
  },

  async getProgress(workoutId: number): Promise<any[]> {
    const { data } = await api.get(`${base}/${workoutId}/progress`)
    return data || []
  },

  async addProgress(workoutId: number, payload: any): Promise<any> {
    const body = {
      ...payload,
      date: payload?.date ?? new Date().toISOString(),
      duration: Number(payload?.duration ?? 0),
      calories: Number(payload?.calories ?? 0),
    }
    const { data } = await api.post(`${base}/${workoutId}/progress`, body)
    return data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${base}/${id}`)
  },

  async instantiateTemplate(templateId: number, data: any): Promise<Workout> {
    const body = {
      ...data,
      templateId: Number(templateId),
      clientId: Number(data.clientId ?? 0),
    }
    try {
      const { data: result } = await api.post<Workout>(`${base}/instantiate/${templateId}`, body)
      return result
    } catch {
      const { data: result } = await api.post<Workout>(`${base}/from-template`, body)
      return result
    }
  },
}

export default workoutService
