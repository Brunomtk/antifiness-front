import type {
  ApiDiet,
  ApiMeal,
  ApiDietProgress,
  ApiDietStats,
  DietListResponse,
  CreateDietRequest,
  CreateMealRequest,
  CreateProgressRequest,
  DietFilters,
} from "@/types/diet"
import { api } from "@/lib/api"

// Token & headers helpers
const getAuthToken = (): string => {
  try {
    return localStorage.getItem("auth_token") ?? ""
  } catch {
    return ""
  }
}

const getHeaders = (json = true): HeadersInit => {
  const base: Record<string, string> = {
    accept: "text/plain",
  }
  if (json) base["Content-Type"] = "application/json"
  return base
}

const handleAuthError = (res: Response) => {
  if (res.status === 401 || res.status === 403) {
    // opcional: redirecionar para login ou limpar token
    console.warn("Auth error:", res.status)
  }
}

class DietService {
  // ---- Diets ----
  async getDiets(filters: DietFilters = {}): Promise<DietListResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v))
    })

    const response = await api.get(`/Diet?${params.toString()}`)
    return response.data
  }

  async getDietById(id: number): Promise<ApiDiet> {
    const response = await api.get(`/Diet/${id}`)
    return response.data
  }

  async createDiet(data: CreateDietRequest): Promise<ApiDiet> {
    const response = await api.post("/Diet", data)
    return response.data
  }

  async updateDiet(id: number, data: Partial<CreateDietRequest>): Promise<ApiDiet> {
    const response = await api.put(`/Diet/${id}`, data)
    return response.data
  }

  async deleteDiet(id: number): Promise<void> {
    await api.delete(`/Diet/${id}`)
  }

  async getDietStats(): Promise<ApiDietStats> {
    const response = await api.get("/Diet/stats")
    return response.data
  }

  // ---- Meals ----
  async getDietMeals(dietId: number): Promise<ApiMeal[]> {
    const response = await api.get(`/Diet/meals?dietId=${dietId}`)
    return Array.isArray(response.data) ? response.data : []
  }

  async createMeal(dietId: number, data: CreateMealRequest): Promise<ApiMeal> {
    const response = await api.post(`/Diet/${dietId}/meals`, data)
    return response.data
  }

  async updateMeal(dietId: number, mealId: number, data: Partial<CreateMealRequest>): Promise<ApiMeal> {
    const response = await api.put(`/Diet/${dietId}/meals/${mealId}`, data)
    return response.data
  }

  async deleteMeal(dietId: number, mealId: number): Promise<void> {
    await api.delete(`/Diet/${dietId}/meals/${mealId}`)
  }

  async completeMeal(mealId: number): Promise<void> {
    await api.post(`/Diet/meals/${mealId}/complete`)
  }

  // ---- Progress ----
  async getDietProgress(dietId: number): Promise<ApiDietProgress[]> {
    const response = await api.get(`/Diet/progress?dietId=${dietId}`)
    return Array.isArray(response.data) ? response.data : []
  }

  async createProgress(dietId: number, data: CreateProgressRequest): Promise<ApiDietProgress> {
    const response = await api.post(`/Diet/${dietId}/progress`, data)
    return response.data
  }
}

export const dietService = new DietService()
export type { DietFilters, CreateDietRequest, CreateMealRequest, CreateProgressRequest }
