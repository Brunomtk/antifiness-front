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

// Helpers
function timeStringToTicks(value: string): number {
  // accepts "HH:mm" or "HH:mm:ss"
  const parts = value.split(":").map((x) => parseInt(x, 10) || 0);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const s = parts[2] ?? 0;
  const totalSeconds = h * 3600 + m * 60 + s;
  return totalSeconds * 10_000_000; // 1s = 10,000,000 ticks
}

function ticksToTimeString(ticks: number): string {
  const totalSeconds = Math.floor(ticks / 10_000_000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

class MealService {
  async getMealsByDiet(dietId: number): Promise<ApiMeal[]> {
    const res = await api.get(`/Diet/${dietId}/meals`, { headers: { Accept: "application/json" } });
    return res.data;
  }

  async createMeal(dietId: number, data: CreateMealRequest): Promise<ApiMeal> {
    // For create, backend expects TimeSpan string ("HH:mm:ss").
    let payload: any = { ...data };
    const st: any = (data as any)?.scheduledTime;
    if (typeof st === "object" && st && typeof st.ticks === "number") {
      payload.scheduledTime = ticksToTimeString(st.ticks);
    }
    const res = await api.post(`/Diet/${dietId}/meals`, payload, { headers: { Accept: "application/json" } });
    return res.data;
  }

  async updateMeal(dietId: number, mealId: number, data: Partial<CreateMealRequest>): Promise<ApiMeal> {
    // For update, use V2 with ticks
    let payload: any = { ...data };
    const st: any = (data as any)?.scheduledTime;
    if (typeof st === "string" && st.trim() !== "") {
      payload.scheduledTime = { ticks: timeStringToTicks(st) };
    } else if (typeof st === "number" && Number.isFinite(st)) {
      payload.scheduledTime = { ticks: st };
    } else if (st && typeof st === "object" && typeof st.ticks === "number") {
      payload.scheduledTime = st;
    } else if (st == null) {
      delete payload.scheduledTime;
    }

    const res = await api.put(`/Diet/${dietId}/meals/${mealId}`, payload, { headers: { Accept: "application/json" } });
    return res.data;
  }

  async deleteMeal(dietId: number, mealId: number): Promise<void> {
    // Preferred route (backend): DELETE /Diet/meals/{mealId}
    try {
      await api.delete(`/Diet/meals/${mealId}`);
      return;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 405) {
        // Fallback to legacy path if server only exposes this
        await api.delete(`/Diet/${dietId}/meals/${mealId}`);
        return;
      }
      throw err;
    }
  }

  async completeMeal(mealId: number): Promise<void> {
    await api.post(`/Diet/meals/${mealId}/complete`, {});
  }

  async getProgressByDiet(dietId: number): Promise<ApiDietProgress[]> {
    const res = await api.get(`/Diet/${dietId}/progress`, { headers: { Accept: "application/json" } });
    return res.data;
  }

  async addProgress(dietId: number, data: CreateProgressRequest): Promise<ApiDietProgress> {
    const res = await api.post(`/Diet/${dietId}/progress`, data, { headers: { Accept: "application/json" } });
    return res.data;
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
