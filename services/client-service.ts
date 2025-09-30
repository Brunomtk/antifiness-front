"use client"

import { api } from "@/lib/api"
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  PagedResult,
  ClientsQuery,
  ClientHistoryItem,
  WeightProgressRequest,
  MeasurementProgressRequest,
  PhotoProgressRequest,
  AchievementRequest,
  ClientStats, // Added ClientStats import
} from "@/types/client"

export type {
  CreateClientRequest,
  UpdateClientRequest,
  WeightProgressRequest,
  MeasurementProgressRequest,
  PhotoProgressRequest,
  AchievementRequest,
}
const base = "/Client"

class ClientService {
  async getPaged(q: ClientsQuery = {}): Promise<PagedResult<Client>> {
    const params: Record<string, any> = {
      page: q.page ?? 1,
      pageSize: q.pageSize ?? 20,
      orderBy: q.orderBy ?? "name",
      orderDirection: q.orderDirection ?? "asc",
    }
    if (q.search && q.search.trim()) params.search = q.search.trim()
    if (q.status !== undefined && q.status !== "") params.status = q.status
    if (q.kanbanStage !== undefined && q.kanbanStage !== "") params.kanbanStage = q.kanbanStage
    if (q.goalType !== undefined && q.goalType !== "") params.goalType = q.goalType
    if (q.activityLevel !== undefined && q.activityLevel !== "") params.activityLevel = q.activityLevel
    if (q.startDate) params.startDate = q.startDate
    if (q.endDate) params.endDate = q.endDate

    const { data } = await api.get<PagedResult<Client>>("/Client", { params })
    return data
  }

  async getById(id: number): Promise<Client> {
    const { data } = await api.get<Client>(`${base}/${id}`)
    return data
  }

  async create(payload: CreateClientRequest): Promise<Client> {
    const { data } = await api.post<Client>(base, payload, { headers: { Accept: "text/plain" } })
    return data
  }

  async update(id: number, payload: UpdateClientRequest): Promise<void> {
    await api.put(`${base}/${id}`, payload, { headers: { Accept: "*/*" } })
  }

  async remove(id: number): Promise<void> {
    await api.delete(`${base}/${id}`)
  }

  async getStats(): Promise<ClientStats> {
    // Changed return type from Record<string, any> to ClientStats
    try {
      const { data } = await api.get<Record<string, any>>(`${base}/stats`)

      const stats: ClientStats = {
        totalClients: data?.totalClients ?? 0,
        activeClients: data?.activeClients ?? 0,
        newClientsThisMonth: data?.newClientsThisMonth ?? 0,
        completedGoals: data?.completedGoals ?? 0,
        averageProgress: data?.averageProgress ?? 0,
        retentionRate: data?.retentionRate ?? 0,
      }

      return stats
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return {
          totalClients: 0,
          activeClients: 0,
          newClientsThisMonth: 0,
          completedGoals: 0,
          averageProgress: 0,
          retentionRate: 0,
        }
      }
      console.warn("getStats falhou:", error?.response?.status || error?.message || error)
      return {
        totalClients: 0,
        activeClients: 0,
        newClientsThisMonth: 0,
        completedGoals: 0,
        averageProgress: 0,
        retentionRate: 0,
      }
    }
  }

  async getHistory(id: number): Promise<ClientHistoryItem[]> {
    try {
      const { data } = await api.get<ClientHistoryItem[]>(`${base}/${id}/history`)
      return data ?? []
    } catch (error: any) {
      if (error?.response?.status === 404) return []
      console.warn("getHistory falhou:", error?.response?.status || error?.message || error)
      return []
    }
  }

  async postWeight(clientId: number, payload: { date: string; weight: number; notes?: string }): Promise<any> {
    const { data } = await api.post(`${base}/${clientId}/progress/weight`, payload, {
      headers: { Accept: "text/plain" },
    })
    return data
  }

  async postMeasurements(
    clientId: number,
    payload: {
      date: string
      bodyFat?: number
      muscleMass?: number
      waist?: number
      chest?: number
      arms?: number
      thighs?: number
      notes?: string
    },
  ): Promise<any> {
    const { data } = await api.post(`${base}/${clientId}/progress/measurements`, payload, {
      headers: { Accept: "text/plain" },
    })
    return data
  }

  async postPhoto(clientId: number, payload: { date: string; image: string; notes?: string }): Promise<any> {
    const { data } = await api.post(`${base}/${clientId}/progress/photos`, payload, {
      headers: { Accept: "text/plain" },
    })
    return data
  }

  async postAchievement(
    clientId: number,
    payload: { title: string; description?: string; type?: string; category?: string },
  ): Promise<any> {
    const { data } = await api.post(`${base}/${clientId}/achievements`, payload, { headers: { Accept: "text/plain" } })
    return data
  }

  async getBasic(id: number): Promise<any> {
    const { data } = await api.get(`${base}/${id}/basic`)
    return data
  }

  async getDietCurrent(id: number): Promise<any> {
    const { data } = await api.get(`${base}/${id}/diet/current`)
    return data
  }
  async getDietHistory(id: number): Promise<any[]> {
    const { data } = await api.get(`${base}/${id}/diet/history`)
    return data ?? []
  }

  async getWorkoutCurrent(id: number): Promise<any> {
    const { data } = await api.get(`${base}/${id}/workout/current`)
    return data
  }
  async getWorkoutHistory(id: number): Promise<any[]> {
    const { data } = await api.get(`${base}/${id}/workout/history`)
    return data ?? []
  }

  // Alias compatível com hooks existentes
  async getClients(
    filters: ClientsQuery & { empresaId?: number | string; planId?: number | string },
  ): Promise<PagedResult<Client>> {
    // Nosso backend ignora planId; mantemos no objeto sem enviar se vazio
    const { planId, ...rest } = filters || {}
    return this.getPaged(rest)
  }

  // --- Aliases de compatibilidade com hooks antigos ---
  async getClientById(id: number) {
    return this.getById(id)
  }

  async createClient(payload: CreateClientRequest) {
    return this.create(payload)
  }

  async updateClient(id: number, payload: UpdateClientRequest) {
    await this.update(id, payload)
    return { success: true } as any
  }

  async deleteClient(id: number) {
    return this.remove(id)
  }

  async getClientStats(): Promise<ClientStats> {
    // Changed return type from Record<string, any> to ClientStats
    return this.getStats()
  }

  async addWeightProgress(clientId: number, data: { date: string; weight: number; notes?: string }) {
    return this.postWeight(clientId, data)
  }

  async addMeasurementProgress(
    clientId: number,
    data: {
      date: string
      bodyFat?: number
      muscleMass?: number
      waist?: number
      chest?: number
      arms?: number
      thighs?: number
      notes?: string
    },
  ) {
    return this.postMeasurements(clientId, data)
  }

  async addPhotoProgress(clientId: number, data: { date: string; image: string; notes?: string }) {
    return this.postPhoto(clientId, data)
  }

  async addAchievement(
    clientId: number,
    data: { title: string; description?: string; type?: string; category?: string },
  ) {
    return this.postAchievement(clientId, data)
  }
}

export const clientService = new ClientService()
