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
      const response = await api.post<ApiResponse>("/Users", data)
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
}
