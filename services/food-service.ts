import type { ApiFood, CreateFoodRequest, UpdateFoodRequest, FoodFilters } from "@/types/food"
import { api } from "@/lib/api"

class FoodService {
  // CRUD Alimentos
  async getFoods(filters: FoodFilters = {}): Promise<ApiFood[]> {
    const params = new URLSearchParams()

    if (filters.search) params.append("search", filters.search)
    if (filters.category !== undefined) params.append("category", filters.category.toString())

    const queryString = params.toString() ? `?${params.toString()}` : ""

    const response = await api.get(`/Food${queryString}`)
    return response.data
  }

  async getFoodById(id: number): Promise<ApiFood> {
    const response = await api.get(`/Food/${id}`)
    return response.data
  }

  async createFood(data: CreateFoodRequest): Promise<ApiFood> {
    const response = await api.post("/Food", data)
    return response.data
  }

  async updateFood(id: number, data: UpdateFoodRequest): Promise<ApiFood> {
    const response = await api.put(`/Food/${id}`, data)
    return response.data
  }

  async deleteFood(id: number): Promise<void> {
    await api.delete(`/Food/${id}`)
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

  getFoodCategoryOptions() {
    return [
      { value: 1, label: "Carboidratos", icon: "🍞", color: "bg-amber-100 text-amber-800" },
      { value: 2, label: "Proteínas", icon: "🥩", color: "bg-red-100 text-red-800" },
      { value: 3, label: "Gorduras", icon: "🥑", color: "bg-green-100 text-green-800" },
      { value: 4, label: "Vegetais", icon: "🥬", color: "bg-emerald-100 text-emerald-800" },
      { value: 5, label: "Frutas", icon: "🍎", color: "bg-pink-100 text-pink-800" },
      { value: 6, label: "Laticínios", icon: "🥛", color: "bg-blue-100 text-blue-800" },
      { value: 7, label: "Outros", icon: "🍽️", color: "bg-gray-100 text-gray-800" },
    ]
  }
}

export const foodService = new FoodService()
export type { FoodFilters, CreateFoodRequest, UpdateFoodRequest }
