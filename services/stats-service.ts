import type {
  ClientStats,
  CourseStats,
  DietStats,
  FeedbackStats,
  UserStats,
  WorkoutStats,
  DashboardStats,
  StatsFilters,
} from "@/types/stats"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:44394/api"

class StatsService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accept: "text/plain",
    }
  }

  async getClientStats(filters?: StatsFilters): Promise<ClientStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const url = `${API_BASE_URL}/Client/stats${params.toString() ? `?${params.toString()}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas de clientes: ${response.statusText}`)
    }

    return response.json()
  }

  async getCourseStats(filters?: StatsFilters): Promise<CourseStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const url = `${API_BASE_URL}/Course/stats${params.toString() ? `?${params.toString()}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas de cursos: ${response.statusText}`)
    }

    return response.json()
  }

  async getDietStats(filters?: StatsFilters): Promise<DietStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const url = `${API_BASE_URL}/Diet/stats${params.toString() ? `?${params.toString()}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas de dietas: ${response.statusText}`)
    }

    return response.json()
  }

  async getFeedbackStats(filters?: StatsFilters): Promise<FeedbackStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const url = `${API_BASE_URL}/Feedback/stats${params.toString() ? `?${params.toString()}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas de feedbacks: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserStats(filters?: StatsFilters): Promise<UserStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const url = `${API_BASE_URL}/Users/stats${params.toString() ? `?${params.toString()}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        accept: "*/*",
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas de usuários: ${response.statusText}`)
    }

    return response.json()
  }

  async getWorkoutStats(filters?: StatsFilters): Promise<WorkoutStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const url = `${API_BASE_URL}/Workout/stats${params.toString() ? `?${params.toString()}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas de treinos: ${response.statusText}`)
    }

    return response.json()
  }

  async getAllStats(filters?: StatsFilters): Promise<DashboardStats> {
    try {
      const [clients, courses, diets, feedbacks, users, workouts] = await Promise.all([
        this.getClientStats(filters),
        this.getCourseStats(filters),
        this.getDietStats(filters),
        this.getFeedbackStats(filters),
        this.getUserStats(filters),
        this.getWorkoutStats(filters),
      ])

      return {
        clients,
        courses,
        diets,
        feedbacks,
        users,
        workouts,
      }
    } catch (error) {
      console.error("Erro ao buscar todas as estatísticas:", error)
      throw error
    }
  }
}

export const statsService = new StatsService()
