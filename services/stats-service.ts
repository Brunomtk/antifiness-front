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
import { api } from "@/lib/api"

class StatsService {
  async getClientStats(filters?: StatsFilters): Promise<ClientStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const queryString = params.toString() ? `?${params.toString()}` : ""

    const response = await api.get(`/Client/stats${queryString}`)
    return response.data
  }

  async getCourseStats(filters?: StatsFilters): Promise<CourseStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const queryString = params.toString() ? `?${params.toString()}` : ""

    const response = await api.get(`/Course/stats${queryString}`)
    return response.data
  }

  async getDietStats(filters?: StatsFilters): Promise<DietStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const queryString = params.toString() ? `?${params.toString()}` : ""

    const response = await api.get(`/Diet/stats${queryString}`)
    return response.data
  }

  async getFeedbackStats(filters?: StatsFilters): Promise<FeedbackStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const queryString = params.toString() ? `?${params.toString()}` : ""

    const response = await api.get(`/Feedback/stats${queryString}`)
    return response.data
  }

  async getUserStats(filters?: StatsFilters): Promise<UserStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const queryString = params.toString() ? `?${params.toString()}` : ""

    const response = await api.get(`/Users/stats${queryString}`)
    return response.data
  }

  async getWorkoutStats(filters?: StatsFilters): Promise<WorkoutStats> {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append("empresaId", filters.empresaId.toString())
    if (filters?.clientId) params.append("clientId", filters.clientId.toString())

    const queryString = params.toString() ? `?${params.toString()}` : ""

    const response = await api.get(`/Workout/stats${queryString}`)
    return response.data
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
