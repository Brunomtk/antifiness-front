export type PagedResult<T> = {
  results: T[]
  currentPage: number
  pageCount: number
  pageSize: number
  rowCount: number
  firstRowOnPage: number
  lastRowOnPage: number
}

export type PlanGoal = {
  type: number
  target: number
  unit: string
  description?: string
}

export type FoodMacros = {
  carbs: number
  protein: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

export type PlanFood = {
  name: string
  quantity: number
  unit: string
  calories: number
  macros: FoodMacros
  category: number
}

export type PlanMeal = {
  name: string
  type: number
  time: string // HH:mm:ss
  calories: number
  macros: FoodMacros
  foods: PlanFood[]
  instructions?: string
}

export type PlanProgress = {
  date: string // ISO
  weight: number
  calories: number
  mealsCompleted: number
  totalMeals: number
  notes?: string
  photos: string[]
}

export type PlanBase = {
  name: string
  description?: string
  type: number
  duration: number
  targetCalories?: number
  targetWeight?: number
  clientId?: number
  nutritionistId?: number
  startDate: string // ISO
  notes?: string
}

export type CreatePlanRequest = PlanBase & {
  goals?: PlanGoal[]
  meals?: PlanMeal[]
  progressEntries?: PlanProgress[]
}

export type UpdatePlanRequest = CreatePlanRequest

export type Plan = PlanBase & {
  id: number
  status: number
  endDate: string | null
  isActive: boolean
  goals: PlanGoal[]
  meals: PlanMeal[]
  progressEntries: PlanProgress[]
  createdAt: string
  updatedAt: string
}

export const planTypeLabel = (t: number) => {
  const map: Record<number, string> = {
    0: "Padrão",
    1: "Perda de Peso",
    2: "Ganho de Massa",
    3: "Manutenção",
  }
  return map[t] ?? `Tipo ${t}`
}

export const planStatusLabel = (s: number) => {
  const map: Record<number, string> = {
    0: "Rascunho",
    1: "Ativo",
    2: "Concluído",
    3: "Pausado",
  }
  return map[s] ?? `Status ${s}`
}
