export type WorkoutExercise = {
  id?: number
  exerciseId: number
  exerciseName?: string
  order: number
  sets: number
  reps: number
  weight?: number
  restTime?: number
  notes?: string
  isCompleted?: boolean
  completedSets?: number | null
}

export type Workout = {
  id: number
  name: string
  description?: string
  type?: number
  difficulty?: number
  status?: number
  estimatedDuration?: number
  estimatedCalories?: number
  tags?: string[]
  isTemplate?: boolean
  notes?: string
  empresaId?: number
  clientId?: number | null
  exercises?: WorkoutExercise[]
  createdAt?: string
  updatedAt?: string
}

export type WorkoutsPage = {
  workouts: Workout[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type WorkoutsQuery = {
  type?: number[]
  difficulty?: number[]
  status?: number[]
  tags?: string[]
  search?: string
  dateStart?: string
  dateEnd?: string
  isTemplate?: boolean
  empresaId?: number
  clientId?: number
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type WorkoutStats = {
  totalExercises?: number
  activeExercises?: number
  totalWorkouts?: number
  completedWorkouts?: number
  templateWorkouts?: number
  completionRate?: number
  totalDuration?: number
  totalCalories?: number
  averageRating?: number
  personalRecords?: number
  workoutsByType?: { type: string; count: number; percentage: number }[]
  muscleGroupDistribution?: { muscleGroup: string; count: number; percentage: number }[]
}

export type WorkoutProgressExercise = {
  exerciseId: number
  exerciseName?: string
  completedSets?: number
  completedReps?: number
  weight?: number
  isCompleted?: boolean
}

export type WorkoutProgress = {
  id: number
  workoutId: number
  workoutName?: string
  clientId?: number
  date: string
  actualDuration?: number
  actualCalories?: number
  rating?: number
  mood?: number
  energyLevel?: number
  isCompleted?: boolean
  exerciseProgress?: WorkoutProgressExercise[]
  notes?: string
  hasPersonalRecord?: boolean
  createdAt?: string
}

export type CreateWorkoutRequest = Omit<Workout, "id" | "createdAt" | "updatedAt" | "exercises" | "status"> & {
  exercises?: Omit<WorkoutExercise, "id" | "isCompleted" | "completedSets" | "exerciseName">[]
}

export type UpdateWorkoutRequest = CreateWorkoutRequest

export type CreateWorkoutProgressRequest = Omit<WorkoutProgress, "id" | "workoutName" | "createdAt"> & {
  exerciseProgress?: WorkoutProgressExercise[]
}
// ---- Enums adicionados para compatibilidade com WorkoutContext e demais telas ----
export enum MuscleGroup {
  CHEST = "CHEST",
  BACK = "BACK",
  SHOULDERS = "SHOULDERS",
  BICEPS = "BICEPS",
  TRICEPS = "TRICEPS",
  CORE = "CORE",
  QUADRICEPS = "QUADRICEPS",
  HAMSTRINGS = "HAMSTRINGS",
  GLUTES = "GLUTES",
  CALVES = "CALVES",
  FULL_BODY = "FULL_BODY",
}

export enum Equipment {
  BARBELL = "BARBELL",
  DUMBBELL = "DUMBBELL",
  MACHINE = "MACHINE",
  CABLE = "CABLE",
  BAND = "BAND",
  KETTLEBELL = "KETTLEBELL",
  BODYWEIGHT = "BODYWEIGHT",
  BENCH = "BENCH",
}

export enum ExerciseDifficulty {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
}

export enum ExerciseCategory {
  COMPOUND = 1,
  ISOLATION = 2,
  CARDIO = 3,
  MOBILITY = 4,
}

export enum WorkoutType {
  STRENGTH = 1,
  HYPERTROPHY = 2,
  HIIT = 3,
  CARDIO = 4,
  MOBILITY = 5,
}

export enum WorkoutDifficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

export enum WorkoutStatus {
  DRAFT = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  ARCHIVED = 3,
}

export enum WorkoutGoal {
  FAT_LOSS = 1,
  MUSCLE_GAIN = 2,
  PERFORMANCE = 3,
  MAINTENANCE = 4,
}

export enum WorkoutLevel {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
}

export enum WorkoutPlanStatus {
  ACTIVE = 1,
  PAUSED = 2,
  COMPLETED = 3,
}

// Reexport Exercise type for modules that import from "@/types/workout"
export type { Exercise } from "./exercise"

// ---- Helper labels (used by client/workout pages) ----
export function getWorkoutTypeLabel(type: number): string {
  const map: Record<number, string> = {
    [WorkoutType.STRENGTH]: "Força",
    [WorkoutType.HYPERTROPHY]: "Hipertrofia",
    [WorkoutType.HIIT]: "HIIT",
    [WorkoutType.CARDIO]: "Cardio",
    [WorkoutType.MOBILITY]: "Mobilidade",
  }
  return map[type] ?? "Treino"
}

export function getWorkoutDifficultyLabel(level: number): string {
  const map: Record<number, string> = {
    [WorkoutLevel.BEGINNER]: "Iniciante",
    [WorkoutLevel.INTERMEDIATE]: "Intermediário",
    [WorkoutLevel.ADVANCED]: "Avançado",
  }
  return map[level] ?? "Nível"
}

export function getWorkoutStatusLabel(status: number): string {
  const map: Record<number, string> = {
    0: "Rascunho",
    1: "Ativo",
    2: "Concluído",
    3: "Arquivado",
  }
  return map[status] ?? "Status"
}

export function getWorkoutMoodLabel(mood: number): string {
  const map: Record<number, string> = {
    1: "Muito ruim",
    2: "Ruim",
    3: "Neutro",
    4: "Bom",
    5: "Excelente",
  }
  return map[mood] ?? "Humor"
}
