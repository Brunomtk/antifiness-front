// API Response Types - Alinhados com a nova API
export interface ApiDiet {
  id: number
  name: string
  description: string
  clientId: number
  clientName: string
  empresaId: number
  empresaName: string
  startDate: string
  endDate: string
  status: DietStatus
  statusDescription: string
  dailyCalories: number
  dailyProtein: number
  dailyCarbs: number
  dailyFat: number
  dailyFiber: number
  dailySodium: number
  restrictions: string
  notes: string
  totalMeals: number
  completedMeals: number
  completionPercentage: number
  createdAt: string
  updatedAt: string
  meals: ApiMeal[]
}

export interface ApiMeal {
  id: number
  dietId: number
  name: string
  type: MealType
  typeDescription: string
  scheduledTime: {
    ticks: number
    days: number
    hours: number
    milliseconds: number
    microseconds: number
    nanoseconds: number
    minutes: number
    seconds: number
    totalDays: number
    totalHours: number
    totalMilliseconds: number
    totalMicroseconds: number
    totalNanoseconds: number
    totalMinutes: number
    totalSeconds: number
  }
  instructions: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
  foods: ApiMealFood[]
}

export interface ApiMealFood {
  id: number
  mealId: number
  foodId: number
  foodName: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
}

export interface ApiDietProgress {
  id: number
  dietId: number
  date: string
  weight: number
  caloriesConsumed: number
  mealsCompleted: number
  totalMeals: number
  completionPercentage: number
  notes: string
  energyLevel: number
  hungerLevel: number
  satisfactionLevel: number
  createdAt: string
  updatedAt: string
}

export interface ApiDietStats {
  totalDiets: number
  activeDiets: number
  completedDiets: number
  pausedDiets: number
  cancelledDiets: number
  activeDietsPercentage: number
  completedDietsPercentage: number
  pausedDietsPercentage: number
  cancelledDietsPercentage: number
  averageCaloriesPerDiet: number
  averageMealsPerDiet: number
  averageCompletionRate: number
  totalMeals: number
  completedMeals: number
  mealCompletionPercentage: number
  averageWeightLoss: number
  averageEnergyLevel: number
  averageSatisfactionLevel: number
  dietsThisMonth: number
  dietsLastMonth: number
  monthlyGrowth: number
}

export interface DietListResponse {
  diets: ApiDiet[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// Enums
export enum DietStatus {
  DRAFT = 0,
  ACTIVE = 1,
  PAUSED = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

export enum MealType {
  BREAKFAST = 0,
  MORNING_SNACK = 1,
  LUNCH = 2,
  AFTERNOON_SNACK = 3,
  DINNER = 4,
  EVENING_SNACK = 5,
  PRE_WORKOUT = 6,
  POST_WORKOUT = 7,
}

export enum FoodCategory {
  PROTEINS = 1,
  CARBS = 2,
  VEGETABLES = 3,
  FRUITS = 4,
  DAIRY = 5,
  FATS = 6,
  BEVERAGES = 7,
  SUPPLEMENTS = 8,
  OTHERS = 9,
}

export enum DietCategory {
  WEIGHT_LOSS = 1,
  WEIGHT_GAIN = 2,
  MAINTENANCE = 3,
  MUSCLE_GAIN = 4,
  CUTTING = 5,
  BULKING = 6,
  THERAPEUTIC = 7,
}

// Request Types
export interface CreateDietRequest {
  name: string
  description: string
  clientId: number
  empresaId: number
  startDate: string
  endDate: string
  status: DietStatus
  dailyCalories: number
  dailyProtein: number
  dailyCarbs: number
  dailyFat: number
  dailyFiber: number
  dailySodium: number
  restrictions: string
  notes: string
}

export interface CreateMealRequest {
  name: string
  type: MealType
  scheduledTime: string | { ticks: number }
  instructions: string
  foods: CreateMealFoodRequest[]
}

export interface CreateMealFoodRequest {
  foodId: number
  quantity: number
  unit: string
}

export interface CreateProgressRequest {
  date: string
  weight: number
  caloriesConsumed: number
  mealsCompleted: number
  totalMeals: number
  notes: string
  energyLevel: number
  hungerLevel: number
  satisfactionLevel: number
}

// Filter Types
export interface DietFilters {
  pageNumber?: number
  pageSize?: number
  search?: string
  status?: DietStatus
  clientId?: number
  empresaId?: number
  startDateFrom?: string
  startDateTo?: string
  endDateFrom?: string
  endDateTo?: string
  hasEndDate?: boolean
  minCalories?: number
  maxCalories?: number
}

// Utility functions
export const getDietStatusLabel = (status: DietStatus): string => {
  const labels = {
    [DietStatus.DRAFT]: "Rascunho",
    [DietStatus.ACTIVE]: "Ativa",
    [DietStatus.PAUSED]: "Pausada",
    [DietStatus.COMPLETED]: "Concluída",
    [DietStatus.CANCELLED]: "Cancelada",
  }
  return labels[status] || "Desconhecido"
}

export const getDietStatusColor = (status: DietStatus): string => {
  const colors = {
    [DietStatus.DRAFT]: "border-gray-500 text-gray-500",
    [DietStatus.ACTIVE]: "border-green-500 text-green-500",
    [DietStatus.PAUSED]: "border-yellow-500 text-yellow-500",
    [DietStatus.COMPLETED]: "border-blue-500 text-blue-500",
    [DietStatus.CANCELLED]: "border-red-500 text-red-500",
  }
  return colors[status] || "border-gray-500 text-gray-500"
}

export const getMealTypeLabel = (type: MealType): string => {
  const labels = {
    [MealType.BREAKFAST]: "Café da Manhã",
    [MealType.MORNING_SNACK]: "Lanche da Manhã",
    [MealType.LUNCH]: "Almoço",
    [MealType.AFTERNOON_SNACK]: "Lanche da Tarde",
    [MealType.DINNER]: "Jantar",
    [MealType.EVENING_SNACK]: "Ceia",
    [MealType.PRE_WORKOUT]: "Pré-Treino",
    [MealType.POST_WORKOUT]: "Pós-Treino",
  }
  return labels[type] || "Refeição"
}

export const getFoodCategoryLabel = (category: FoodCategory): string => {
  const labels = {
    [FoodCategory.PROTEINS]: "Proteínas",
    [FoodCategory.CARBS]: "Carboidratos",
    [FoodCategory.VEGETABLES]: "Vegetais",
    [FoodCategory.FRUITS]: "Frutas",
    [FoodCategory.DAIRY]: "Laticínios",
    [FoodCategory.FATS]: "Gorduras",
    [FoodCategory.BEVERAGES]: "Bebidas",
    [FoodCategory.SUPPLEMENTS]: "Suplementos",
    [FoodCategory.OTHERS]: "Outros",
  }
  return labels[category] || "Outros"
}

export const getDietCategoryLabel = (category: DietCategory): string => {
  const labels = {
    [DietCategory.WEIGHT_LOSS]: "Emagrecimento",
    [DietCategory.WEIGHT_GAIN]: "Ganho de Peso",
    [DietCategory.MAINTENANCE]: "Manutenção",
    [DietCategory.MUSCLE_GAIN]: "Ganho de Massa",
    [DietCategory.CUTTING]: "Cutting",
    [DietCategory.BULKING]: "Bulking",
    [DietCategory.THERAPEUTIC]: "Terapêutica",
  }
  return labels[category] || "Outros"
}

// Legacy types for compatibility
export interface Food {
  id: string
  name: string
  category: FoodCategory
  calories_per_100g: number
  macros: MacroNutrients
  unit: string
  common_portions: Portion[]
  allergens: string[]
  created_at: string
  updated_at: string
}

export interface Portion {
  name: string
  grams: number
  description?: string
}

export interface MacroNutrients {
  carbs: number
  protein: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface DietFood {
  id: string
  food_id: string
  food: Food
  quantity: number
  unit: string
  calories: number
  macros: MacroNutrients
  notes?: string
  substitutes?: string[]
}

export interface Meal {
  id: string
  diet_id: string
  type: MealType
  name: string
  time: string
  foods: DietFood[]
  total_calories: number
  total_macros: MacroNutrients
  instructions?: string
  completed: boolean
  completed_at?: string
  notes?: string
}

export interface Diet {
  id: string
  client_id: string
  nutritionist_id: string
  name: string
  description?: string
  start_date: string
  end_date?: string
  status: DietStatus
  goals: DietGoals
  restrictions: string[]
  meals: Meal[]
  daily_targets: MacroNutrients & { calories: number }
  created_at: string
  updated_at: string
}

export interface DietGoals {
  target_weight?: number
  weekly_weight_change?: number
  daily_calories: number
  macro_distribution: {
    carbs_percentage: number
    protein_percentage: number
    fat_percentage: number
  }
  water_intake?: number
}

export interface DietProgress {
  id: string
  diet_id: string
  date: string
  meals_completed: number
  total_meals: number
  calories_consumed: number
  macros_consumed: MacroNutrients
  weight?: number
  notes?: string
  photos?: string[]
  adherence_score: number
}

export interface DietTemplate {
  id: string
  name: string
  description: string
  category: DietCategory
  duration_days: number
  target_calories: number
  meals: Omit<Meal, "id" | "diet_id" | "completed" | "completed_at">[]
  is_public: boolean
  created_by: string
  usage_count: number
  rating: number
  created_at: string
}
