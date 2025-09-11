"use client"

import { api } from "@/lib/api"
import type {
  Exercise,
  ExercisesQuery,
  ExercisesPage,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from "@/types/exercise"

const base = "/Exercise"

const clean = (obj: Record<string, any>) => {
  const out: Record<string, any> = {}
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) return
    out[k] = v
  })
  return out
}

class ExerciseService {
  async getPaged(q: ExercisesQuery = {}): Promise<ExercisesPage> {
    const params = clean({
      MuscleGroups: q.muscleGroups,
      Equipment: q.equipment,
      Difficulty: q.difficulty,
      Category: q.category,
      Search: q.search,
      IsActive: q.isActive,
      EmpresaId: q.empresaId,
      Page: q.page ?? 1,
      PageSize: q.pageSize ?? 10,
      SortBy: q.sortBy,
      SortOrder: q.sortOrder,
    })
    const { data } = await api.get<ExercisesPage>(base, { params, headers: { Accept: "text/plain" } })
    return data
  }

  async getById(id: number): Promise<Exercise> {
    const { data } = await api.get<Exercise>(`${base}/${id}`, { headers: { Accept: "text/plain" } })
    return data
  }

  async create(payload: CreateExerciseRequest): Promise<Exercise> {
    const { data } = await api.post<Exercise>(base, payload, {
      headers: { "Content-Type": "application/json", Accept: "text/plain" },
    })
    return data
  }

  async update(id: number, payload: UpdateExerciseRequest): Promise<Exercise> {
    const { data } = await api.put<Exercise>(`${base}/${id}`, payload, {
      headers: { "Content-Type": "application/json", Accept: "text/plain" },
    })
    return data
  }

  async remove(id: number): Promise<void> {
    await api.delete(`${base}/${id}`, { headers: { Accept: "*/*" } })
  }
}

export const exerciseService = new ExerciseService()

export const validateExercise = (exercise: any): boolean => {
  return !!(exercise.name && exercise.description && exercise.muscleGroups)
}
