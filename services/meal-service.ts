import { api } from "@/lib/api"
import type { ApiMeal, ApiDietProgress, CreateMealRequest, CreateProgressRequest } from "@/types/diet"
import { ticksToTimeString } from "@/lib/utils"

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

class MealService {
  async getMealsByDiet(dietId: number): Promise<ApiMeal[]> {
    const res = await api.get(`/Diet/${dietId}/meals`, { headers: { Accept: "application/json" } })
    return res.data
  }

  async createMeal(dietId: number, data: CreateMealRequest): Promise<ApiMeal> {
    // For create, backend expects TimeSpan string ("HH:mm:ss").
    const payload: any = { ...data }
    const st: any = (data as any)?.scheduledTime
    if (typeof st === "object" && st && typeof st.ticks === "number") {
      payload.scheduledTime = ticksToTimeString(st.ticks)
    }
    const res = await api.post(`/Diet/${dietId}/meals`, payload, { headers: { Accept: "application/json" } })
    return res.data
  }

  async updateMeal(dietId: number, mealId: number, data: Partial<CreateMealRequest>): Promise<ApiMeal> {
    console.log("[v0] MealService.updateMeal called with:", { dietId, mealId, data })

    let scheduledTimeString = "12:00:00"
    if (data.scheduledTime) {
      if (typeof data.scheduledTime === "string" && data.scheduledTime.includes(":")) {
        // Ensure proper TimeSpan format (HH:mm:ss)
        const parts = data.scheduledTime.split(":")
        const hours = parts[0]?.padStart(2, "0") || "12"
        const minutes = parts[1]?.padStart(2, "0") || "00"
        const seconds = parts[2]?.padStart(2, "0") || "00"
        scheduledTimeString = `${hours}:${minutes}:${seconds}`
      }
    }

    const cleanFoods = (data.foods || []).map((food) => ({
      foodId: food.foodId,
      quantity: food.quantity,
      unit: food.unit,
    }))

    console.log("[v0] Clean foods array for API:", cleanFoods)
    console.log("[v0] Number of foods being sent:", cleanFoods.length)

    const requestPayload = {
      name: data.name || "",
      type: data.type || 0,
      scheduledTime: scheduledTimeString,
      instructions: data.instructions || "",
      isCompleted: false,
      foods: cleanFoods,
    }

    console.log("[v0] Final API request payload:", requestPayload)
    console.log("[v0] Foods in request payload:", requestPayload.foods)

    const res = await api.put(`/Diet/${dietId}/meals/${mealId}`, requestPayload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] API response received:", res.data)
    return res.data
  }

  async deleteMeal(dietId: number, mealId: number): Promise<void> {
    // Preferred route (backend): DELETE /Diet/meals/{mealId}
    try {
      await api.delete(`/Diet/meals/${mealId}`)
      return
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 404 || status === 405) {
        // Fallback to legacy path if server only exposes this
        await api.delete(`/Diet/${dietId}/meals/${mealId}`)
        return
      }
      throw err
    }
  }

  async completeMeal(mealId: number): Promise<void> {
    await api.post(`/Diet/meals/${mealId}/complete`, {})
  }

  async getProgressByDiet(dietId: number): Promise<ApiDietProgress[]> {
    const res = await api.get(`/Diet/${dietId}/progress`, { headers: { Accept: "application/json" } })
    return res.data
  }

  async addProgress(dietId: number, data: CreateProgressRequest): Promise<ApiDietProgress> {
    const res = await api.post(`/Diet/${dietId}/progress`, data, { headers: { Accept: "application/json" } })
    return res.data
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

export type Meal = ApiMeal
