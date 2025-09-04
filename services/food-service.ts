import type { ApiFood, CreateFoodRequest, UpdateFoodRequest, FoodFilters } from "@/types/food"

const API_BASE_URL = "https://localhost:44394/api"

// Função para obter token de autenticação
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token") || ""
  }
  return ""
}

// Headers padrão para requisições
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
  accept: "*/*",
})

// Função para tratar erros de autenticação
const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
      window.location.href = "/login"
    }
    throw new Error("Sessão expirada. Faça login novamente.")
  }
}

class FoodService {
  // CRUD Alimentos
  async getFoods(filters: FoodFilters = {}): Promise<ApiFood[]> {
    const params = new URLSearchParams()

    if (filters.search) params.append("search", filters.search)
    if (filters.category !== undefined) params.append("category", filters.category.toString())

    const url = `${API_BASE_URL}/Food${params.toString() ? `?${params.toString()}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    })

    handleAuthError(response)

    if (!response.ok) {
      throw new Error(`Erro ao buscar alimentos: ${response.status}`)
    }

    // A API retorna diretamente um array, não um objeto paginado
    return response.json()
  }

  async getFoodById(id: number): Promise<ApiFood> {
    const response = await fetch(`${API_BASE_URL}/Food/${id}`, {
      method: "GET",
      headers: getHeaders(),
    })

    handleAuthError(response)

    if (!response.ok) {
      throw new Error(`Erro ao buscar alimento: ${response.status}`)
    }

    return response.json()
  }

  async createFood(data: CreateFoodRequest): Promise<ApiFood> {
    const response = await fetch(`${API_BASE_URL}/Food`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })

    handleAuthError(response)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Erro na criação do alimento:", errorData)
      throw new Error(`Erro ao criar alimento: ${response.status}`)
    }

    return response.json()
  }

  async updateFood(id: number, data: UpdateFoodRequest): Promise<ApiFood> {
    const response = await fetch(`${API_BASE_URL}/Food/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })

    handleAuthError(response)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Erro na atualização do alimento:", errorData)
      throw new Error(`Erro ao atualizar alimento: ${response.status}`)
    }

    return response.json()
  }

  async deleteFood(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Food/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    })

    handleAuthError(response)

    if (!response.ok) {
      throw new Error(`Erro ao excluir alimento: ${response.status}`)
    }
  }

  // Busca avançada
  async searchFoods(query: string, category?: number): Promise<ApiFood[]> {
    return this.getFoods({ search: query, category })
  }

  // Alimentos por categoria
  async getFoodsByCategory(category: number): Promise<ApiFood[]> {
    return this.getFoods({ category })
  }

  // Alimentos ativos
  async getActiveFoods(): Promise<ApiFood[]> {
    const foods = await this.getFoods()
    return foods.filter((food) => food.isActive)
  }
}

export const foodService = new FoodService()
export type { FoodFilters, CreateFoodRequest, UpdateFoodRequest }
