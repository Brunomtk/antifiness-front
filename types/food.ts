// API Response Types - Alinhados com a nova API de Food
export interface ApiFood {
  id: number
  name: string
  description: string
  category: FoodCategory
  categoryDescription: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
  sodiumPer100g: number
  allergens: string
  commonPortions: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FoodListResponse {
  foods: ApiFood[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// Enums
export enum FoodCategory {
  PROTEINS = 0,
  CARBS = 1,
  VEGETABLES = 2,
  FRUITS = 3,
  DAIRY = 4,
  FATS = 5,
  BEVERAGES = 6,
  SUPPLEMENTS = 7,
  OTHERS = 8,
}

// Request Types
export interface CreateFoodRequest {
  name: string
  description: string
  category: FoodCategory
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
  sodiumPer100g: number
  allergens: string
  commonPortions: string
  isActive: boolean
}

export interface UpdateFoodRequest extends CreateFoodRequest {}

// Filter Types
export interface FoodFilters {
  pageNumber?: number
  pageSize?: number
  search?: string
  category?: FoodCategory
  isActive?: boolean
}

// Utility functions
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

export const getFoodCategoryColor = (category: FoodCategory): string => {
  const colors = {
    [FoodCategory.PROTEINS]: "border-red-500 text-red-500 bg-red-50",
    [FoodCategory.CARBS]: "border-orange-500 text-orange-500 bg-orange-50",
    [FoodCategory.VEGETABLES]: "border-green-500 text-green-500 bg-green-50",
    [FoodCategory.FRUITS]: "border-pink-500 text-pink-500 bg-pink-50",
    [FoodCategory.DAIRY]: "border-blue-500 text-blue-500 bg-blue-50",
    [FoodCategory.FATS]: "border-yellow-500 text-yellow-500 bg-yellow-50",
    [FoodCategory.BEVERAGES]: "border-cyan-500 text-cyan-500 bg-cyan-50",
    [FoodCategory.SUPPLEMENTS]: "border-purple-500 text-purple-500 bg-purple-50",
    [FoodCategory.OTHERS]: "border-gray-500 text-gray-500 bg-gray-50",
  }
  return colors[category] || "border-gray-500 text-gray-500 bg-gray-50"
}

// Nutritional calculation helpers
export const calculateNutrition = (
  food: ApiFood,
  quantity: number,
): {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
} => {
  const factor = quantity / 100
  return {
    calories: Math.round(food.caloriesPer100g * factor),
    protein: Math.round(food.proteinPer100g * factor * 10) / 10,
    carbs: Math.round(food.carbsPer100g * factor * 10) / 10,
    fat: Math.round(food.fatPer100g * factor * 10) / 10,
    fiber: Math.round(food.fiberPer100g * factor * 10) / 10,
    sodium: Math.round(food.sodiumPer100g * factor),
  }
}

export const parseCommonPortions = (commonPortions: string): Array<{ name: string; grams: number }> => {
  try {
    if (!commonPortions) return []

    // Se for JSON, parse diretamente
    if (commonPortions.startsWith("[") || commonPortions.startsWith("{")) {
      return JSON.parse(commonPortions)
    }

    // Se for string simples, tenta fazer parse manual
    const portions = commonPortions.split(",").map((portion) => {
      const parts = portion.trim().split(":")
      if (parts.length === 2) {
        return {
          name: parts[0].trim(),
          grams: Number.parseInt(parts[1].trim()) || 100,
        }
      }
      return { name: portion.trim(), grams: 100 }
    })

    return portions
  } catch {
    return [{ name: "Porção padrão", grams: 100 }]
  }
}

export const formatCommonPortions = (portions: Array<{ name: string; grams: number }>): string => {
  return JSON.stringify(portions)
}
