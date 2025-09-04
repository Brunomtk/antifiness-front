import type {
  Feedback,
  CreateFeedbackData,
  UpdateFeedbackData,
  FeedbackListResponse,
  FeedbackFilters,
  FeedbackStats,
} from "@/types/feedback"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:44394/api"

class FeedbackService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token") // Usando 'token' como na API de usuários
    return {
      "Content-Type": "application/json",
      accept: "text/plain",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

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

    const response = await fetch(`${API_BASE_URL}/Feedback?${params.toString()}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token de autenticação inválido ou expirado")
      }
      throw new Error(`Erro ao buscar feedbacks: ${response.statusText}`)
    }

    return response.json()
  }

  // Obter feedback por ID
  async getFeedbackById(id: number): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/Feedback/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token de autenticação inválido ou expirado")
      }
      throw new Error(`Erro ao buscar feedback: ${response.statusText}`)
    }

    return response.json()
  }

  // Criar novo feedback
  async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/Feedback`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token de autenticação inválido ou expirado")
      }
      throw new Error(`Erro ao criar feedback: ${response.statusText}`)
    }

    return response.json()
  }

  // Atualizar feedback
  async updateFeedback(id: number, data: UpdateFeedbackData): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/Feedback/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token de autenticação inválido ou expirado")
      }
      throw new Error(`Erro ao atualizar feedback: ${response.statusText}`)
    }

    return response.json()
  }

  // Deletar feedback
  async deleteFeedback(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Feedback/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token de autenticação inválido ou expirado")
      }
      throw new Error(`Erro ao deletar feedback: ${response.statusText}`)
    }
  }

  // Obter estatísticas
  async getFeedbackStats(): Promise<FeedbackStats> {
    const response = await fetch(`${API_BASE_URL}/Feedback/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token de autenticação inválido ou expirado")
      }
      throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`)
    }

    return response.json()
  }

  // Obter feedbacks de um cliente
  async getFeedbacksByClient(clientId: number): Promise<Feedback[]> {
    const response = await fetch(`${API_BASE_URL}/Feedback/client/${clientId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token de autenticação inválido ou expirado")
      }
      throw new Error(`Erro ao buscar feedbacks do cliente: ${response.statusText}`)
    }

    return response.json()
  }

  // Obter feedbacks de um trainer
  async getFeedbacksByTrainer(trainerId: number): Promise<Feedback[]> {
    const response = await fetch(`${API_BASE_URL}/Feedback/trainer/${trainerId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token de autenticação inválido ou expirado")
      }
      throw new Error(`Erro ao buscar feedbacks do trainer: ${response.statusText}`)
    }

    return response.json()
  }
}

export const feedbackService = new FeedbackService()
