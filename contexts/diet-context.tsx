"use client"

import type React from "react"
import { createContext, useReducer, useContext, type ReactNode } from "react"
import {
  type Diet,
  type Meal,
  type Food,
  type DietProgress,
  type DietTemplate,
  type ApiDietStats,
  type DietFilters,
  DietStatus,
  MealType,
  FoodCategory,
} from "@/types/diet"
import type { FoodFilters } from "@/types/food"

interface DietAnalytics {
  totalCaloriesConsumed: number
  averageDailyCalories: number
  macroDistribution: {
    carbs: number
    protein: number
    fat: number
  }
  adherenceRate: number
  weightProgress: {
    startWeight: number
    currentWeight: number
    weightLoss: number
  }
  mealCompletionRate: number
  weeklyProgress: {
    week: string
    calories: number
    weight: number
    adherence: number
  }[]
}

interface DietState {
  // Diets
  diets: Diet[]
  currentDiet: Diet | null
  selectedDiet: Diet | null

  // Meals & Foods
  meals: Meal[]
  foods: Food[]
  selectedMeal: Meal | null

  // Progress & Analytics
  progress: DietProgress[]
  analytics: DietAnalytics | null

  // Templates
  templates: DietTemplate[]

  // Stats
  stats: ApiDietStats | null

  // Filters
  dietFilters: DietFilters
  foodFilters: FoodFilters

  // UI States
  loading: {
    diets: boolean
    meals: boolean
    foods: boolean
    progress: boolean
    analytics: boolean
    templates: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }

  error: string | null
}

type DietAction =
  | { type: "SET_LOADING"; payload: { key: keyof DietState["loading"]; value: boolean } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_DIETS"; payload: Diet[] }
  | { type: "SET_CURRENT_DIET"; payload: Diet | null }
  | { type: "SET_SELECTED_DIET"; payload: Diet | null }
  | { type: "ADD_DIET"; payload: Diet }
  | { type: "UPDATE_DIET"; payload: Diet }
  | { type: "DELETE_DIET"; payload: string }
  | { type: "SET_MEALS"; payload: Meal[] }
  | { type: "SET_SELECTED_MEAL"; payload: Meal | null }
  | { type: "ADD_MEAL"; payload: Meal }
  | { type: "UPDATE_MEAL"; payload: Meal }
  | { type: "DELETE_MEAL"; payload: string }
  | { type: "SET_FOODS"; payload: Food[] }
  | { type: "ADD_FOOD_TO_MEAL"; payload: { mealId: string; food: any } }
  | { type: "SET_PROGRESS"; payload: DietProgress[] }
  | { type: "ADD_PROGRESS"; payload: DietProgress }
  | { type: "SET_ANALYTICS"; payload: DietAnalytics }
  | { type: "SET_TEMPLATES"; payload: DietTemplate[] }
  | { type: "SET_STATS"; payload: ApiDietStats }
  | { type: "SET_DIET_FILTERS"; payload: DietFilters }
  | { type: "SET_FOOD_FILTERS"; payload: FoodFilters }
  | { type: "COMPLETE_MEAL"; payload: string }

const initialState: DietState = {
  diets: [],
  currentDiet: null,
  selectedDiet: null,
  meals: [],
  foods: [],
  selectedMeal: null,
  progress: [],
  analytics: null,
  templates: [],
  stats: null,
  dietFilters: {},
  foodFilters: {},
  loading: {
    diets: false,
    meals: false,
    foods: false,
    progress: false,
    analytics: false,
    templates: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
}

// Mock Data
const mockFoods: Food[] = [
  {
    id: "1",
    name: "Peito de Frango",
    category: FoodCategory.PROTEINS,
    calories_per_100g: 165,
    macros: { carbs: 0, protein: 31, fat: 3.6 },
    unit: "g",
    common_portions: [
      { name: "Filé médio", grams: 120 },
      { name: "Filé grande", grams: 180 },
    ],
    allergens: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Arroz Integral",
    category: FoodCategory.CARBS,
    calories_per_100g: 123,
    macros: { carbs: 23, protein: 2.6, fat: 1 },
    unit: "g",
    common_portions: [
      { name: "Colher de sopa", grams: 25 },
      { name: "Xícara", grams: 150 },
    ],
    allergens: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Brócolis",
    category: FoodCategory.VEGETABLES,
    calories_per_100g: 34,
    macros: { carbs: 7, protein: 2.8, fat: 0.4 },
    unit: "g",
    common_portions: [
      { name: "Porção pequena", grams: 80 },
      { name: "Porção média", grams: 120 },
    ],
    allergens: [],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

const mockMeals: Meal[] = [
  {
    id: "1",
    diet_id: "1",
    type: MealType.BREAKFAST,
    name: "Café da Manhã",
    time: "07:00",
    foods: [],
    total_calories: 350,
    total_macros: { carbs: 45, protein: 20, fat: 12 },
    completed: false,
    instructions: "Preparar com carinho",
  },
  {
    id: "2",
    diet_id: "1",
    type: MealType.LUNCH,
    name: "Almoço",
    time: "12:00",
    foods: [],
    total_calories: 520,
    total_macros: { carbs: 55, protein: 35, fat: 18 },
    completed: true,
    completed_at: "2024-01-15T12:30:00Z",
  },
]

const mockDiets: Diet[] = [
  {
    id: "1",
    client_id: "1",
    nutritionist_id: "1",
    name: "Dieta de Emagrecimento",
    description: "Plano focado na perda de peso saudável",
    start_date: "2024-01-01",
    end_date: "2024-03-01",
    status: DietStatus.ACTIVE,
    goals: {
      target_weight: 70,
      weekly_weight_change: -0.5,
      daily_calories: 1800,
      macro_distribution: {
        carbs_percentage: 45,
        protein_percentage: 30,
        fat_percentage: 25,
      },
      water_intake: 2500,
    },
    restrictions: ["Lactose", "Glúten"],
    meals: mockMeals,
    daily_targets: {
      calories: 1800,
      carbs: 200,
      protein: 135,
      fat: 50,
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
]

function dietReducer(state: DietState, action: DietAction): DietState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "SET_DIETS":
      return { ...state, diets: action.payload }

    case "SET_CURRENT_DIET":
      return { ...state, currentDiet: action.payload }

    case "SET_SELECTED_DIET":
      return { ...state, selectedDiet: action.payload }

    case "ADD_DIET":
      return { ...state, diets: [...state.diets, action.payload] }

    case "UPDATE_DIET":
      return {
        ...state,
        diets: state.diets.map((diet) => (diet.id === action.payload.id ? action.payload : diet)),
        currentDiet: state.currentDiet?.id === action.payload.id ? action.payload : state.currentDiet,
        selectedDiet: state.selectedDiet?.id === action.payload.id ? action.payload : state.selectedDiet,
      }

    case "DELETE_DIET":
      return {
        ...state,
        diets: state.diets.filter((diet) => diet.id !== action.payload),
        currentDiet: state.currentDiet?.id === action.payload ? null : state.currentDiet,
        selectedDiet: state.selectedDiet?.id === action.payload ? null : state.selectedDiet,
      }

    case "SET_MEALS":
      return { ...state, meals: action.payload }

    case "SET_SELECTED_MEAL":
      return { ...state, selectedMeal: action.payload }

    case "ADD_MEAL":
      return { ...state, meals: [...state.meals, action.payload] }

    case "UPDATE_MEAL":
      return {
        ...state,
        meals: state.meals.map((meal) => (meal.id === action.payload.id ? action.payload : meal)),
      }

    case "DELETE_MEAL":
      return {
        ...state,
        meals: state.meals.filter((meal) => meal.id !== action.payload),
      }

    case "SET_FOODS":
      return { ...state, foods: action.payload }

    case "COMPLETE_MEAL":
      return {
        ...state,
        meals: state.meals.map((meal) =>
          meal.id === action.payload ? { ...meal, completed: true, completed_at: new Date().toISOString() } : meal,
        ),
      }

    case "SET_PROGRESS":
      return { ...state, progress: action.payload }

    case "ADD_PROGRESS":
      return { ...state, progress: [...state.progress, action.payload] }

    case "SET_ANALYTICS":
      return { ...state, analytics: action.payload }

    case "SET_TEMPLATES":
      return { ...state, templates: action.payload }

    case "SET_STATS":
      return { ...state, stats: action.payload }

    case "SET_DIET_FILTERS":
      return { ...state, dietFilters: action.payload }

    case "SET_FOOD_FILTERS":
      return { ...state, foodFilters: action.payload }

    default:
      return state
  }
}

const DietContext = createContext<{
  state: DietState
  dispatch: React.Dispatch<DietAction>
} | null>(null)

export function DietProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dietReducer, {
    ...initialState,
    diets: mockDiets,
    foods: mockFoods,
    meals: mockMeals,
    currentDiet: mockDiets[0],
  })

  return <DietContext.Provider value={{ state, dispatch }}>{children}</DietContext.Provider>
}

export function useDietContext() {
  const context = useContext(DietContext)
  if (!context) {
    throw new Error("useDietContext must be used within a DietProvider")
  }
  return context
}
