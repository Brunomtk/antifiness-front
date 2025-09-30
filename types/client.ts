// --- Enums adicionados para evitar undefined em runtime ---
export enum GoalType {
  WEIGHT_LOSS = 0,
  WEIGHT_GAIN = 1,
  MUSCLE_GAIN = 2,
  MAINTENANCE = 3,
  HEALTH_IMPROVEMENT = 4,
  PERFORMANCE = 5,
}

export enum ActivityLevel {
  SEDENTARY = 0,
  LIGHT = 1,
  MODERATE = 2,
  HIGH = 3,
  VERY_HIGH = 4,
}

export enum ClientStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  PAUSED = 3,
}

export enum KanbanStage {
  LEAD = 0,
  PROSPECT = 1,
  ACTIVE = 2,
  INACTIVE = 3,
  COMPLETED = 4,
}

export function getKanbanStageLabel(stage: KanbanStage | number): string {
  switch (stage) {
    case KanbanStage.LEAD:
      return "Lead"
    case KanbanStage.PROSPECT:
      return "Prospect"
    case KanbanStage.ACTIVE:
      return "Ativo"
    case KanbanStage.INACTIVE:
      return "Inativo"
    case KanbanStage.COMPLETED:
      return "Concluído"
    default:
      return "Desconhecido"
  }
}

export enum Priority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export type PagedResult<T> = {
  results: T[]
  currentPage: number
  pageSize: number
  // Backend pode devolver um destes conjuntos:
  // (a) pageCount/rowCount/firstRowOnPage/lastRowOnPage
  pageCount?: number
  rowCount?: number
  firstRowOnPage?: number
  lastRowOnPage?: number
  // (b) totalPages/totalRecords/hasPreviousPage/hasNextPage
  totalPages?: number
  totalRecords?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}

export type Gender = "Male" | "Female" | "Other"

export type ClientBase = {
  name: string
  email?: string
  phone?: string
  avatar?: string
  dateOfBirth?: string // ISO
  gender?: Gender | string
  height?: number
  currentWeight?: number
  targetWeight?: number
  activityLevel?: number
  kanbanStage?: number
  empresaId?: number
  notes?: string
}

export type CreateClientRequest = ClientBase & {
  goals?: string[]
  dislikedFood?: string[]
  preferredFood?: string[]
  medicalConditions?: string[]
}

export type UpdateClientRequest = CreateClientRequest

export type Client = ClientBase & {
  id: number
  status?: number
  createdDate: string
  updatedDate: string
}

export type ClientHistoryItem = {
  id: number
  type: string
  description: string
  createdDate: string
  createdBy?: string
}

export type ClientsQuery = {
  page?: number
  pageSize?: number
  search?: string
  status?: string | number
  kanbanStage?: string | number
  goalType?: string | number
  activityLevel?: string | number
  orderBy?: "name" | "createdDate" | "updatedDate"
  orderDirection?: "asc" | "desc"
  startDate?: string
  endDate?: string
}

export type WeightProgressRequest = { date: string; weight: number; notes?: string }
export type MeasurementProgressRequest = {
  date: string
  bodyFat?: number
  muscleMass?: number
  waist?: number
  chest?: number
  arms?: number
  thighs?: number
  notes?: string
}
export type PhotoProgressRequest = { date: string; image: string; notes?: string }
export type AchievementRequest = { title: string; description?: string; type?: string; category?: string }

export interface ClientFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: string | number
  kanbanStage?: string | number
  goalType?: string | number
  activityLevel?: string | number
  orderBy?: "name" | "createdDate" | "updatedDate"
  orderDirection?: "asc" | "desc"
  startDate?: string
  endDate?: string
  planId?: number

  empresaId?: number
}

export interface ClientStats {
  totalClients: number
  activeClients: number
  newClientsThisMonth: number
  completedGoals: number
  averageProgress: number
  retentionRate: number
}

export interface ClientsResponse {
  clients: Client[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}


// Backward-compatible aliases
export type CreateClientData = CreateClientRequest;
export type UpdateClientData = UpdateClientRequest;
