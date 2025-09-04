"use client"

import { api } from "@/lib/api"
import type {
  Workout, WorkoutsPage, WorkoutsQuery, CreateWorkoutRequest, UpdateWorkoutRequest, WorkoutStats, WorkoutProgress, CreateWorkoutProgressRequest
} from "@/types/workout"

const base = "/Workout"

const clean = (obj: Record<string, any>) => {
  const out: Record<string, any> = {}
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) return
    out[k] = v
  })
  return out
}

class WorkoutService {
  async getPaged(q: WorkoutsQuery = {}): Promise<WorkoutsPage> {
    const params = clean({
      Type: q.type,
      Difficulty: q.difficulty,
      Status: q.status,
      Tags: q.tags,
      Search: q.search,
      DateStart: q.dateStart,
      DateEnd: q.dateEnd,
      IsTemplate: q.isTemplate,
      EmpresaId: q.empresaId,
      ClientId: q.clientId,
      Page: q.page ?? 1,
      PageSize: q.pageSize ?? 10,
      SortBy: q.sortBy,
      SortOrder: q.sortOrder,
    })
    const { data } = await api.get<WorkoutsPage>(base, { params, headers: { Accept: "text/plain" } })
    return data
  }

  async getById(id: number): Promise<Workout> {
    const { data } = await api.get<Workout>(`${base}/${id}`, { headers: { Accept: "text/plain" } })
    return data
  }

  async create(payload: CreateWorkoutRequest): Promise<Workout> {
    const { data } = await api.post<Workout>(base, payload, { headers: { "Content-Type": "application/json", Accept: "text/plain" } })
    return data
  }

  async update(id: number, payload: UpdateWorkoutRequest): Promise<Workout> {
    const { data } = await api.put<Workout>(`${base}/${id}`, payload, { headers: { "Content-Type": "application/json", Accept: "text/plain" } })
    return data
  }

  async remove(id: number): Promise<void> {
    await api.delete(`${base}/${id}`, { headers: { Accept: "*/*" } })
  }

  async changeStatus(id: number, status: number): Promise<{ message?: string }> {
    const { data } = await api.post(`${base}/${id}/status`, { status }, { headers: { "Content-Type": "application/json", Accept: "*/*" } })
    return data as any
  }

  async getTemplates(q: Omit<WorkoutsQuery, "isTemplate"> = {}): Promise<WorkoutsPage> {
    const params = clean({
      Type: q.type,
      Difficulty: q.difficulty,
      Status: q.status,
      Tags: q.tags,
      Search: q.search,
      DateStart: q.dateStart,
      DateEnd: q.dateEnd,
      EmpresaId: q.empresaId,
      ClientId: q.clientId,
      Page: q.page ?? 1,
      PageSize: q.pageSize ?? 10,
      SortBy: q.sortBy,
      SortOrder: q.sortOrder,
    })
    const { data } = await api.get<WorkoutsPage>(`${base}/templates`, { params, headers: { Accept: "text/plain" } })
    return data
  }

  async instantiateTemplate(templateId: number, payload: CreateWorkoutRequest): Promise<Workout> {
    const { data } = await api.post<Workout>(`${base}/templates/${templateId}/instantiate`, payload, { headers: { "Content-Type": "application/json", Accept: "text/plain" } })
    return data
  }

  async getStats(params?: { empresaId?: number; clientId?: number }): Promise<WorkoutStats> {
    const { data } = await api.get<WorkoutStats>(`${base}/stats`, { params, headers: { Accept: "text/plain" } })
    return data || {}
  }

  async getProgress(workoutId: number): Promise<WorkoutProgress[]> {
    const { data } = await api.get<WorkoutProgress[]>(`${base}/${workoutId}/progress`, { headers: { Accept: "text/plain" } })
    return data || []
  }

  async addProgress(workoutId: number, payload: CreateWorkoutProgressRequest): Promise<WorkoutProgress> {
    const { data } = await api.post<WorkoutProgress>(`${base}/${workoutId}/progress`, payload, { headers: { "Content-Type": "application/json", Accept: "text/plain" } })
    return data
  }
}

export const workoutService = new WorkoutService()
