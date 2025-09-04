export type Exercise = {
  id: number
  name: string
  description?: string
  instructions?: string
  muscleGroups?: string[]
  equipment?: string[]
  difficulty?: number
  category?: number
  tips?: string
  variations?: string
  mediaUrls?: string[]
  isActive?: boolean
  empresaId?: number
  createdAt?: string
  updatedAt?: string
}

export type ExercisesPage = {
  exercises: Exercise[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ExercisesQuery = {
  muscleGroups?: string[]
  equipment?: string[]
  difficulty?: number[]
  category?: number[]
  search?: string
  isActive?: boolean
  empresaId?: number
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type CreateExerciseRequest = Omit<Exercise, "id" | "createdAt" | "updatedAt" | "isActive"> & {
  isActive?: boolean
}
export type UpdateExerciseRequest = CreateExerciseRequest
