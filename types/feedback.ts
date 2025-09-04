// Enums baseados na API
export enum FeedbackType {
  COMPLAINT = 1,
  SUGGESTION = 2,
  COMPLIMENT = 3,
  QUESTION = 4,
  BUG_REPORT = 5,
}

export enum FeedbackCategory {
  APP = 1,
  SERVICE = 2,
  CONTENT = 3,
  TECHNICAL = 4,
  BILLING = 5,
  OTHER = 6,
}

export enum FeedbackStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  RESOLVED = 3,
  CLOSED = 4,
  ESCALATED = 5,
}

// Nomes dos enums para exibição
export const FeedbackTypeNames: Record<FeedbackType, string> = {
  [FeedbackType.COMPLAINT]: "Reclamação",
  [FeedbackType.SUGGESTION]: "Sugestão",
  [FeedbackType.COMPLIMENT]: "Elogio",
  [FeedbackType.QUESTION]: "Pergunta",
  [FeedbackType.BUG_REPORT]: "Relatório de Bug",
}

export const FeedbackCategoryNames: Record<FeedbackCategory, string> = {
  [FeedbackCategory.APP]: "Aplicativo",
  [FeedbackCategory.SERVICE]: "Serviço",
  [FeedbackCategory.CONTENT]: "Conteúdo",
  [FeedbackCategory.TECHNICAL]: "Técnico",
  [FeedbackCategory.BILLING]: "Cobrança",
  [FeedbackCategory.OTHER]: "Outros",
}

export const FeedbackStatusNames: Record<FeedbackStatus, string> = {
  [FeedbackStatus.PENDING]: "Pendente",
  [FeedbackStatus.IN_PROGRESS]: "Em Andamento",
  [FeedbackStatus.RESOLVED]: "Resolvido",
  [FeedbackStatus.CLOSED]: "Fechado",
  [FeedbackStatus.ESCALATED]: "Escalado",
}

// Interface principal do Feedback baseada na resposta da API
export interface Feedback {
  id: number
  clientId: number
  clientName: string
  trainerId: number
  trainerName: string | null
  type: FeedbackType
  typeName: string
  category: FeedbackCategory
  categoryName: string
  title: string
  description: string
  rating: number
  status: FeedbackStatus
  statusName: string
  adminResponse: string | null
  responseDate: string | null
  attachmentUrl: string | null
  isAnonymous: boolean
  createdDate: string
  updatedDate: string
}

// Interface para criar feedback
export interface CreateFeedbackRequest {
  type: FeedbackType
  category: FeedbackCategory
  title: string
  description: string
  rating: number
  attachmentUrl?: string
  isAnonymous: boolean
}

// Interface para criar feedback (dados completos para API)
export interface CreateFeedbackData {
  clientId: number
  trainerId: number
  type: FeedbackType
  category: FeedbackCategory
  title: string
  description: string
  rating: number
  attachmentUrl?: string
  isAnonymous: boolean
}

// Interface para atualizar feedback
export interface UpdateFeedbackData {
  type: FeedbackType
  category: FeedbackCategory
  title: string
  description: string
  rating: number
  status: FeedbackStatus
  adminResponse?: string
  attachmentUrl?: string
  isAnonymous: boolean
}

// Interface para resposta da lista de feedbacks
export interface FeedbackListResponse {
  feedbacks: Feedback[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// Interface para filtros
export interface FeedbackFilters {
  clientId?: number
  trainerId?: number
  type?: FeedbackType
  category?: FeedbackCategory
  status?: FeedbackStatus
  minRating?: number
  maxRating?: number
  startDate?: string
  endDate?: string
  isAnonymous?: boolean
  search?: string
  pageNumber?: number
  pageSize?: number
}

// Interface para estatísticas
export interface FeedbackStats {
  totalFeedbacks: number
  pendingFeedbacks: number
  resolvedFeedbacks: number
  averageRating: number
  feedbacksByType: Record<string, number>
  feedbacksByCategory: Record<string, number>
  feedbacksByStatus: Record<string, number>
}

// Funções auxiliares para obter labels
export function getFeedbackTypeLabel(type: FeedbackType): string {
  return FeedbackTypeNames[type] || "Desconhecido"
}

export function getFeedbackCategoryLabel(category: FeedbackCategory): string {
  return FeedbackCategoryNames[category] || "Desconhecido"
}

export function getFeedbackStatusLabel(status: FeedbackStatus): string {
  return FeedbackStatusNames[status] || "Desconhecido"
}
