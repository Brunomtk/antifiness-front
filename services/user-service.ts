import { api } from "@/lib/api"
import type { User, CreateUserData, UpdateUserData, ApiResponse } from "@/types/user"

export class UserService {
  static async getUser(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`/Users/${id}`)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      throw new Error("Falha ao buscar dados do usuário")
    }
  }

  static async updateUser(id: number, data: UpdateUserData): Promise<ApiResponse> {
    try {
      const response = await api.put<ApiResponse>(`/Users/${id}`, data)
      return response.data
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      throw new Error("Falha ao atualizar usuário")
    }
  }

  static async createUser(data: CreateUserData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>("/Users/create", data)
      return response.data
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      throw new Error("Falha ao criar usuário")
    }
  }

  static async deleteUser(id: number): Promise<ApiResponse> {
    try {
      const response = await api.delete<ApiResponse>(`/Users/${id}`)
      return response.data
    } catch (error) {
      console.error("Erro ao deletar usuário:", error)
      throw new Error("Falha ao deletar usuário")
    }
  }

  static async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await api.post<{ url: string }>("/Users/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data.url
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error)
      throw new Error("Falha ao fazer upload da imagem")
    }
  }

  static async getUsers(params?: {
    role?: string
    status?: string
    search?: string
    page?: number
    pageSize?: number
  }): Promise<{ users: User[]; totalPages: number; totalUsers: number }> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.role) searchParams.append("role", params.role)
      if (params?.status) searchParams.append("status", params.status)
      if (params?.search) searchParams.append("search", params.search)
      if (params?.page) searchParams.append("page", params.page.toString())
      if (params?.pageSize) searchParams.append("pageSize", params.pageSize.toString())

      const response = await api.get<User[]>(`/Users?${searchParams.toString()}`)
      const users = response.data

      // Calculate pagination (assuming API returns all results for now)
      const totalUsers = users.length
      const pageSize = params?.pageSize || 10
      const totalPages = Math.ceil(totalUsers / pageSize)

      return { users, totalPages, totalUsers }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      throw new Error("Falha ao buscar usuários")
    }
  }

  static async getUserStats(): Promise<{
    totalUsers: number
    totalAdmins: number
    totalClients: number
    activeUsers: number
    inactiveUsers: number
    pendingUsers: number
    newUsersThisMonth: number
    verifiedAdmins: number
    clientsWithNutritionist: number
    growthPercentage: number
  }> {
    try {
      const response = await api.get("/Users/stats")
      return response.data
    } catch (error) {
      console.error("Erro ao buscar estatísticas de usuários:", error)
      throw new Error("Falha ao buscar estatísticas")
    }
  }
}
