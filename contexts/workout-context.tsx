"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type {
  Workout,
  WorkoutPlan,
  Exercise,
  WorkoutProgress,
  WorkoutTemplate,
  WorkoutStats,
  WorkoutAnalytics,
  WorkoutFilters,
  WorkoutPlanFilters,
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
        workouts: state.workouts.filter((workout) => workout.id !== Number(action.payload)),
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
        exercises: state.exercises.filter((exercise) => exercise.id !== Number(action.payload)),
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

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState)

  return <WorkoutContext.Provider value={{ state, dispatch }}>{children}</WorkoutContext.Provider>
}

export function useWorkoutContext() {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error("useWorkoutContext must be used within a WorkoutProvider")
  }
  return context
}
