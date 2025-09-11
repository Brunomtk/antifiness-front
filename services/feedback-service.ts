import type {
  Feedback,
  CreateFeedbackData,
  UpdateFeedbackData,
  FeedbackListResponse,
  FeedbackFilters,
  FeedbackStats,
} from "@/types/feedback"
import { api } from "@/lib/api"

class FeedbackService {
  // Listar feedbacks com paginação e filtros
  async getFeedbacks(filters?: FeedbackFilters): Promise<FeedbackListResponse> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.clientId) params.append("ClientId", filters.clientId.toString())
      if (filters.trainerId) params.append("TrainerId", filters.trainerId.toString())
      if (filters.type) params.append("Type", filters.type.toString())
      if (filters.category) params.append("Category", filters.category.toString())
      if (filters.status) params.append("Status", filters.status.toString())
      if (filters.minRating) params.append("MinRating", filters.minRating.toString())
      if (filters.maxRating) params.append("MaxRating", filters.maxRating.toString())
      if (filters.startDate) params.append("StartDate", filters.startDate)
      if (filters.endDate) params.append("EndDate", filters.endDate)
      if (filters.isAnonymous !== undefined) params.append("IsAnonymous", filters.isAnonymous.toString())
      if (filters.search) params.append("Search", filters.search)
      if (filters.pageNumber) params.append("pageNumber", filters.pageNumber.toString())
      if (filters.pageSize) params.append("pageSize", filters.pageSize.toString())
    }

    // Valores padrão para paginação
    if (!params.has("pageNumber")) params.append("pageNumber", "1")
    if (!params.has("pageSize")) params.append("pageSize", "10")

    const response = await api.get(`/Feedback?${params.toString()}`)
    return response.data
  }

  // Obter feedback por ID
  async getFeedbackById(id: number): Promise<Feedback> {
    const response = await api.get(`/Feedback/${id}`)
    return response.data
  }

  // Criar novo feedback
  async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    const response = await api.post("/Feedback", data)
    return response.data
  }

  // Atualizar feedback
  async updateFeedback(id: number, data: UpdateFeedbackData): Promise<Feedback> {
    const response = await api.put(`/Feedback/${id}`, data)
    return response.data
  }

  // Deletar feedback
  async deleteFeedback(id: number): Promise<void> {
    await api.delete(`/Feedback/${id}`)
  }

  // Obter estatísticas
  async getFeedbackStats(): Promise<FeedbackStats> {
    const response = await api.get("/Feedback/stats")
    return response.data
  }

  // Obter feedbacks de um cliente
  async getFeedbacksByClient(clientId: number): Promise<Feedback[]> {
    const response = await api.get(`/Feedback/client/${clientId}`)
    return response.data
  }

  // Obter feedbacks de um trainer
  async getFeedbacksByTrainer(trainerId: number): Promise<Feedback[]> {
    const response = await api.get(`/Feedback/trainer/${trainerId}`)
    return response.data
  }
}

export const feedbackService = new FeedbackService()
