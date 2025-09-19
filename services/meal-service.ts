import { api } from "@/lib/api"
import type { ApiMeal, ApiDietProgress, CreateMealRequest, CreateProgressRequest } from "@/types/diet"

export interface MealFood {
  id?: number
  mealId?: number
  foodId: number
  foodName?: string
  quantity: number
  unit: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
}

export interface Meal {
  id: number
  dietId: number
  name: string
  type: number
  typeDescription?: string
  scheduledTime: string
  instructions?: string
  isCompleted?: boolean
  totalCalories?: number
  totalProtein?: number
  foods: MealFood[]
}

class MealService {
  // ---- Meals ----
  async getMealsByDiet(dietId: number): Promise<ApiMeal[]> {
    // Prefer a dedicated endpoint if available, else fallback to Diet details
    try {
      const res = await api.get(`/Diet/${dietId}/meals`)
      return Array.isArray(res.data) ? res.data : []
    } catch (_e) {
      const dietRes = await api.get(`/Diet/${dietId}`)
      const diet = dietRes.data || {}
      return Array.isArray(diet.meals) ? diet.meals : []
    }
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

  // ---- Progress (proxy to Diet endpoints) ----
  async getProgressByDiet(dietId: number): Promise<ApiDietProgress[]> {
    const response = await api.get(`/Diet/progress?dietId=${dietId}`)
    return Array.isArray(response.data) ? response.data : []
  }

  async addProgress(dietId: number, data: CreateProgressRequest) {
    const response = await api.post(`/Diet/${dietId}/progress`, data)
    return response.data
  }

  getMealTypeOptions() {
    return [
      { value: 0, label: "Café da Manhã", icon: "☀️", color: "bg-orange-100 text-orange-800" },
      { value: 1, label: "Lanche da Manhã", icon: "🥐", color: "bg-yellow-100 text-yellow-800" },
      { value: 2, label: "Almoço", icon: "🍽️", color: "bg-green-100 text-green-800" },
      { value: 3, label: "Lanche da Tarde", icon: "🍎", color: "bg-blue-100 text-blue-800" },
      { value: 4, label: "Jantar", icon: "🌙", color: "bg-purple-100 text-purple-800" },
      { value: 5, label: "Ceia", icon: "🌃", color: "bg-indigo-100 text-indigo-800" },
    ]
  }
}

export const mealService = new MealService()
