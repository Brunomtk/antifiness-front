"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import {
  type Workout,
  type WorkoutPlan,
  type Exercise,
  type WorkoutProgress,
  type WorkoutTemplate,
  type WorkoutStats,
  type WorkoutAnalytics,
  type WorkoutFilters,
  type WorkoutPlanFilters,
  WorkoutType,
  WorkoutDifficulty,
  WorkoutStatus,
  WorkoutGoal,
  WorkoutLevel,
  WorkoutPlanStatus,
  ExerciseDifficulty,
  ExerciseCategory,
  MuscleGroup,
  Equipment,
} from "@/types/workout"

interface WorkoutState {
  // Data
  workouts: Workout[]
  workoutPlans: WorkoutPlan[]
  exercises: Exercise[]
  workoutProgress: WorkoutProgress[]
  workoutTemplates: WorkoutTemplate[]

  // UI State
  selectedWorkout: Workout | null
  selectedWorkoutPlan: WorkoutPlan | null
  selectedExercise: Exercise | null

  // Filters
  workoutFilters: WorkoutFilters
  workoutPlanFilters: WorkoutPlanFilters

  // Stats & Analytics
  workoutStats: WorkoutStats | null
  workoutAnalytics: WorkoutAnalytics | null

  // Loading states
  loading: {
    workouts: boolean
    workoutPlans: boolean
    exercises: boolean
    progress: boolean
    templates: boolean
    stats: boolean
    analytics: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }

  // Error states
  error: {
    workouts: string | null
    workoutPlans: string | null
    exercises: string | null
    progress: string | null
    templates: string | null
    stats: string | null
    analytics: string | null
    general: string | null
  }
}

type WorkoutAction =
  | { type: "SET_LOADING"; payload: { key: keyof WorkoutState["loading"]; value: boolean } }
  | { type: "SET_ERROR"; payload: { key: keyof WorkoutState["error"]; value: string | null } }
  | { type: "SET_WORKOUTS"; payload: Workout[] }
  | { type: "SET_WORKOUT_PLANS"; payload: WorkoutPlan[] }
  | { type: "SET_EXERCISES"; payload: Exercise[] }
  | { type: "SET_WORKOUT_PROGRESS"; payload: WorkoutProgress[] }
  | { type: "SET_WORKOUT_TEMPLATES"; payload: WorkoutTemplate[] }
  | { type: "SET_SELECTED_WORKOUT"; payload: Workout | null }
  | { type: "SET_SELECTED_WORKOUT_PLAN"; payload: WorkoutPlan | null }
  | { type: "SET_SELECTED_EXERCISE"; payload: Exercise | null }
  | { type: "SET_WORKOUT_FILTERS"; payload: WorkoutFilters }
  | { type: "SET_WORKOUT_PLAN_FILTERS"; payload: WorkoutPlanFilters }
  | { type: "SET_WORKOUT_STATS"; payload: WorkoutStats }
  | { type: "SET_WORKOUT_ANALYTICS"; payload: WorkoutAnalytics }
  | { type: "ADD_WORKOUT"; payload: Workout }
  | { type: "UPDATE_WORKOUT"; payload: Workout }
  | { type: "DELETE_WORKOUT"; payload: string }
  | { type: "ADD_WORKOUT_PLAN"; payload: WorkoutPlan }
  | { type: "UPDATE_WORKOUT_PLAN"; payload: WorkoutPlan }
  | { type: "DELETE_WORKOUT_PLAN"; payload: string }
  | { type: "ADD_EXERCISE"; payload: Exercise }
  | { type: "UPDATE_EXERCISE"; payload: Exercise }
  | { type: "DELETE_EXERCISE"; payload: string }
  | { type: "ADD_WORKOUT_PROGRESS"; payload: WorkoutProgress }
  | { type: "UPDATE_WORKOUT_PROGRESS"; payload: WorkoutProgress }

const initialState: WorkoutState = {
  workouts: [],
  workoutPlans: [],
  exercises: [],
  workoutProgress: [],
  workoutTemplates: [],
  selectedWorkout: null,
  selectedWorkoutPlan: null,
  selectedExercise: null,
  workoutFilters: {},
  workoutPlanFilters: {},
  workoutStats: null,
  workoutAnalytics: null,
  loading: {
    workouts: false,
    workoutPlans: false,
    exercises: false,
    progress: false,
    templates: false,
    stats: false,
    analytics: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: {
    workouts: null,
    workoutPlans: null,
    exercises: null,
    progress: null,
    templates: null,
    stats: null,
    analytics: null,
    general: null,
  },
}

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }
    case "SET_ERROR":
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.key]: action.payload.value,
        },
      }
    case "SET_WORKOUTS":
      return { ...state, workouts: action.payload }
    case "SET_WORKOUT_PLANS":
      return { ...state, workoutPlans: action.payload }
    case "SET_EXERCISES":
      return { ...state, exercises: action.payload }
    case "SET_WORKOUT_PROGRESS":
      return { ...state, workoutProgress: action.payload }
    case "SET_WORKOUT_TEMPLATES":
      return { ...state, workoutTemplates: action.payload }
    case "SET_SELECTED_WORKOUT":
      return { ...state, selectedWorkout: action.payload }
    case "SET_SELECTED_WORKOUT_PLAN":
      return { ...state, selectedWorkoutPlan: action.payload }
    case "SET_SELECTED_EXERCISE":
      return { ...state, selectedExercise: action.payload }
    case "SET_WORKOUT_FILTERS":
      return { ...state, workoutFilters: action.payload }
    case "SET_WORKOUT_PLAN_FILTERS":
      return { ...state, workoutPlanFilters: action.payload }
    case "SET_WORKOUT_STATS":
      return { ...state, workoutStats: action.payload }
    case "SET_WORKOUT_ANALYTICS":
      return { ...state, workoutAnalytics: action.payload }
    case "ADD_WORKOUT":
      return { ...state, workouts: [...state.workouts, action.payload] }
    case "UPDATE_WORKOUT":
      return {
        ...state,
        workouts: state.workouts.map((workout) => (workout.id === action.payload.id ? action.payload : workout)),
      }
    case "DELETE_WORKOUT":
      return {
        ...state,
        workouts: state.workouts.filter((workout) => workout.id !== action.payload),
      }
    case "ADD_WORKOUT_PLAN":
      return { ...state, workoutPlans: [...state.workoutPlans, action.payload] }
    case "UPDATE_WORKOUT_PLAN":
      return {
        ...state,
        workoutPlans: state.workoutPlans.map((plan) => (plan.id === action.payload.id ? action.payload : plan)),
      }
    case "DELETE_WORKOUT_PLAN":
      return {
        ...state,
        workoutPlans: state.workoutPlans.filter((plan) => plan.id !== action.payload),
      }
    case "ADD_EXERCISE":
      return { ...state, exercises: [...state.exercises, action.payload] }
    case "UPDATE_EXERCISE":
      return {
        ...state,
        exercises: state.exercises.map((exercise) => (exercise.id === action.payload.id ? action.payload : exercise)),
      }
    case "DELETE_EXERCISE":
      return {
        ...state,
        exercises: state.exercises.filter((exercise) => exercise.id !== action.payload),
      }
    case "ADD_WORKOUT_PROGRESS":
      return { ...state, workoutProgress: [...state.workoutProgress, action.payload] }
    case "UPDATE_WORKOUT_PROGRESS":
      return {
        ...state,
        workoutProgress: state.workoutProgress.map((progress) =>
          progress.id === action.payload.id ? action.payload : progress,
        ),
      }
    default:
      return state
  }
}

const WorkoutContext = createContext<{
  state: WorkoutState
  dispatch: React.Dispatch<WorkoutAction>
} | null>(null)

// Mock data
const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "Supino Reto",
    description: "Exercício para desenvolvimento do peitoral",
    instructions: [
      "Deite-se no banco com os pés apoiados no chão",
      "Segure a barra com pegada pronada",
      "Desça a barra até o peito",
      "Empurre a barra para cima",
    ],
    muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
    equipment: [Equipment.BARBELL, Equipment.BENCH],
    difficulty: ExerciseDifficulty.INTERMEDIATE,
    category: ExerciseCategory.COMPOUND,
    tips: ["Mantenha os ombros retraídos", "Controle a descida"],
    variations: ["Supino inclinado", "Supino declinado"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Agachamento",
    description: "Exercício fundamental para pernas e glúteos",
    instructions: [
      "Posicione a barra nos ombros",
      "Desça flexionando quadris e joelhos",
      "Mantenha o peito erguido",
      "Suba empurrando o chão",
    ],
    muscleGroups: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: [Equipment.BARBELL],
    difficulty: ExerciseDifficulty.INTERMEDIATE,
    category: ExerciseCategory.COMPOUND,
    tips: ["Mantenha os joelhos alinhados", "Desça até 90 graus"],
    variations: ["Agachamento frontal", "Agachamento búlgaro"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockWorkouts: Workout[] = [
  {
    id: "1",
    name: "Treino de Peito e Tríceps",
    description: "Treino focado no desenvolvimento do peitoral e tríceps",
    type: WorkoutType.STRENGTH,
    difficulty: WorkoutDifficulty.INTERMEDIATE,
    duration: 60,
    exercises: [
      {
        id: "1",
        exerciseId: "1",
        exercise: mockExercises[0],
        sets: 4,
        reps: "8-10",
        weight: 80,
        restTime: 120,
        order: 1,
        completed: false,
        completedSets: 0,
      },
    ],
    muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
    equipment: [Equipment.BARBELL, Equipment.BENCH],
    calories: 300,
    status: WorkoutStatus.SCHEDULED,
    tags: ["força", "hipertrofia"],
    isTemplate: false,
    createdBy: "nutritionist-1",
    assignedTo: ["client-1"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: "1",
    name: "Plano de Hipertrofia - 12 Semanas",
    description: "Plano completo para ganho de massa muscular",
    goal: WorkoutGoal.MUSCLE_GAIN,
    level: WorkoutLevel.INTERMEDIATE,
    duration: 12,
    workoutsPerWeek: 4,
    workouts: [{ dayOfWeek: 1, workoutId: "1", workout: mockWorkouts[0] }],
    clientId: "client-1",
    nutritionistId: "nutritionist-1",
    startDate: new Date(),
    endDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
    status: WorkoutPlanStatus.ACTIVE,
    progress: {
      completedWorkouts: 15,
      totalWorkouts: 48,
      completionRate: 31.25,
      currentWeek: 4,
      totalWeeks: 12,
      averageRating: 4.2,
      totalCaloriesBurned: 4500,
      personalRecords: 8,
      adherenceRate: 85,
      lastWorkoutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextWorkoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockWorkoutStats: WorkoutStats = {
  totalWorkouts: 45,
  completedWorkouts: 38,
  totalDuration: 2280, // 38 hours
  totalCalories: 11400,
  averageRating: 4.3,
  currentStreak: 5,
  longestStreak: 12,
  personalRecords: 15,
  favoriteExercises: [
    { exerciseId: "1", exerciseName: "Supino Reto", count: 12 },
    { exerciseId: "2", exerciseName: "Agachamento", count: 10 },
  ],
  weeklyProgress: [
    { week: "2024-01", workouts: 4, duration: 240, calories: 1200 },
    { week: "2024-02", workouts: 3, duration: 180, calories: 900 },
  ],
  muscleGroupDistribution: [
    { muscleGroup: MuscleGroup.CHEST, percentage: 25 },
    { muscleGroup: MuscleGroup.BACK, percentage: 20 },
    { muscleGroup: MuscleGroup.QUADRICEPS, percentage: 18 },
  ],
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, {
    ...initialState,
    exercises: mockExercises,
    workouts: mockWorkouts,
    workoutPlans: mockWorkoutPlans,
    workoutStats: mockWorkoutStats,
  })

  return <WorkoutContext.Provider value={{ state, dispatch }}>{children}</WorkoutContext.Provider>
}

export function useWorkoutContext() {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error("useWorkoutContext must be used within a WorkoutProvider")
  }
  return context
}
