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

const API_BASE_URL = "https://localhost:44394/api"

// Token & headers helpers
const getAuthToken = (): string => {
  try {
    return localStorage.getItem("auth_token") ?? ""
  } catch {
    return ""
  }
}

const getHeaders = (json = true): HeadersInit => {
  const token = getAuthToken()
  const base: Record<string, string> = {
    accept: "text/plain",
  }
  if (json) base["Content-Type"] = "application/json"
  if (token) base["Authorization"] = `Bearer ${token}`
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

    const resp = await fetch(`${API_BASE_URL}/Diet?${params.toString()}`, {
      method: "GET",
      headers: getHeaders(false),
      cache: "no-store",
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao carregar dietas: ${resp.status}`)
    return resp.json()
  }

  async getDietById(id: number): Promise<ApiDiet> {
    const resp = await fetch(`${API_BASE_URL}/Diet/${id}`, {
      method: "GET",
      headers: getHeaders(false),
      cache: "no-store",
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao carregar dieta: ${resp.status}`)
    return resp.json()
  }

  async createDiet(data: CreateDietRequest): Promise<ApiDiet> {
    const resp = await fetch(`${API_BASE_URL}/Diet`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao criar dieta: ${resp.status}`)
    return resp.json()
  }

  async updateDiet(id: number, data: Partial<CreateDietRequest>): Promise<ApiDiet> {
    const resp = await fetch(`${API_BASE_URL}/Diet/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao atualizar dieta: ${resp.status}`)
    return resp.json()
  }

  async deleteDiet(id: number): Promise<void> {
    const resp = await fetch(`${API_BASE_URL}/Diet/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao excluir dieta: ${resp.status}`)
  }

  async getDietStats(): Promise<ApiDietStats> {
    const resp = await fetch(`${API_BASE_URL}/Diet/stats`, {
      method: "GET",
      headers: getHeaders(false),
      cache: "no-store",
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao carregar estatísticas: ${resp.status}`)
    return resp.json() as Promise<ApiDietStats>
  }

  // ---- Meals ----
  async getDietMeals(dietId: number): Promise<ApiMeal[]> {
    const resp = await fetch(`${API_BASE_URL}/Diet/meals?dietId=${dietId}`, {
      method: "GET",
      headers: getHeaders(false),
      cache: "no-store",
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao carregar refeições: ${resp.status}`)
    const data = await resp.json()
    return Array.isArray(data) ? data : []
  }

  async createMeal(dietId: number, data: CreateMealRequest): Promise<ApiMeal> {
    const resp = await fetch(`${API_BASE_URL}/Diet/${dietId}/meals`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao criar refeição: ${resp.status}`)
    return resp.json()
  }

  async updateMeal(dietId: number, mealId: number, data: Partial<CreateMealRequest>): Promise<ApiMeal> {
    const resp = await fetch(`${API_BASE_URL}/Diet/${dietId}/meals/${mealId}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao atualizar refeição: ${resp.status}`)
    return resp.json()
  }

  async deleteMeal(dietId: number, mealId: number): Promise<void> {
    const resp = await fetch(`${API_BASE_URL}/Diet/${dietId}/meals/${mealId}`, {
      method: "DELETE",
      headers: getHeaders(false),
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao excluir refeição: ${resp.status}`)
  }

  async completeMeal(mealId: number): Promise<void> {
    // Ajuste a rota conforme seu backend
    const resp = await fetch(`${API_BASE_URL}/Diet/meals/${mealId}/complete`, {
      method: "POST",
      headers: getHeaders(false),
    })
    handleAuthError(resp)
    if (resp.status === 404) throw new Error('Refeição não encontrada no servidor');
    if (!resp.ok) throw new Error(`Erro ao concluir refeição: ${resp.status}`)
  }

  // ---- Progress ----
  async getDietProgress(dietId: number): Promise<ApiDietProgress[]> {
    const resp = await fetch(`${API_BASE_URL}/Diet/progress?dietId=${dietId}`, {
      method: "GET",
      headers: getHeaders(false),
      cache: "no-store",
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao buscar progresso: ${resp.status}`)
    const data = await resp.json()
    return Array.isArray(data) ? data : []
  }

  async createProgress(dietId: number, data: CreateProgressRequest): Promise<ApiDietProgress> {
    const resp = await fetch(`${API_BASE_URL}/Diet/${dietId}/progress`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    })
    handleAuthError(resp)
    if (!resp.ok) throw new Error(`Erro ao criar progresso: ${resp.status}`)
    return resp.json()
  }
}

export const dietService = new DietService()
export type { DietFilters, CreateDietRequest, CreateMealRequest, CreateProgressRequest }
