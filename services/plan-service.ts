"use client"

import { api } from "@/lib/api"
import type { CreatePlanRequest, Plan, PagedResult, UpdatePlanRequest } from "@/types/plan"

const base = "/Plans"

class PlanService {
  async getPaged(page = 1, pageSize = 20): Promise<PagedResult<Plan>> {
    const { data } = await api.get<PagedResult<Plan>>(base, { params: { page, pageSize } })
    return data
  }

  async getById(id: number): Promise<Plan> {
    const { data } = await api.get<Plan>(`${base}/${id}`)
    return data
  }

  async create(payload: CreatePlanRequest): Promise<Plan> {
    const { data } = await api.post<Plan>(base, payload, { headers: { Accept: "text/plain" } })
    return data
  }

  async update(id: number, payload: UpdatePlanRequest): Promise<void> {
    await api.put(`${base}/${id}`, payload, { headers: { Accept: "*/*" } })
  }

  async remove(id: number): Promise<void> {
    await api.delete(`${base}/${id}`)
  }
}

export const planService = new PlanService()
