import { api } from "@/lib/api"

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
  id?: number
  dietId: number
  name: string
  type: number
  typeDescription?: string
  scheduledTime: string
  instructions?: string
  totalCalories?: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
  isCompleted?: boolean
  completedAt?: string
  createdAt?: string
  updatedAt?: string
  foods: MealFood[]
}

export interface CreateMealRequest {
  name: string
  type: number
  scheduledTime: string
  instructions?: string
  foods: {
    foodId: number
    quantity: number
    unit: string
  }[]
}

export class MealService {
  async getMealsByDiet(dietId: number): Promise<Meal[]> {
    const response = await api.get(`/Diet/meals?dietId=${dietId}`)
    return response.data
  }

  async createMeal(dietId: number, meal: CreateMealRequest): Promise<Meal> {
    const response = await api.post(`/Diet/${dietId}/meals`, meal)
    return response.data
  }

  async updateMeal(mealId: number, meal: CreateMealRequest): Promise<Meal> {
    const response = await api.put(`/Diet/meals/${mealId}`, meal)
    return response.data
  }

  async deleteMeal(mealId: number): Promise<void> {
    await api.delete(`/Diet/meals/${mealId}`)
  }

  async completeMeal(mealId: number): Promise<void> {
    await api.post(`/Diet/meals/${mealId}/complete`)
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
