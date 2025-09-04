import type {
  Notification,
  NotificationStats,
  CreateNotificationData,
  UpdateNotificationData,
  MarkAllReadData,
  NotificationFilters,
} from "@/types/notification"

class NotificationService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    try {
      const params = new URLSearchParams()

      if (filters?.type && Array.isArray(filters.type)) {
        filters.type.forEach((t) => params.append("Type", t))
      } else if (filters?.type) {
        params.append("Type", filters.type.toString())
      }

      if (filters?.category && Array.isArray(filters.category)) {
        filters.category.forEach((c) => params.append("Category", c))
      } else if (filters?.category) {
        params.append("Category", filters.category.toString())
      }

      if (filters?.priority && Array.isArray(filters.priority)) {
        filters.priority.forEach((p) => params.append("Priority", p))
      } else if (filters?.priority) {
        params.append("Priority", filters.priority.toString())
      }

      if (filters?.read !== undefined) params.append("Read", filters.read.toString())
      if (filters?.startDate) params.append("StartDate", filters.startDate)
      if (filters?.endDate) params.append("EndDate", filters.endDate)
      if (filters?.search) params.append("Search", filters.search)
      if (filters?.page) params.append("Page", filters.page.toString())
      if (filters?.limit) params.append("Limit", filters.limit.toString())

      const queryString = params.toString()
      const url = `https://localhost:44394/api/Notification${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar notificações: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
      throw error
    }
  }

  async getNotificationById(id: number): Promise<Notification> {
    try {
      const response = await fetch(`https://localhost:44394/api/Notification/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar notificação: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar notificação:", error)
      throw error
    }
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const response = await fetch(`https://localhost:44394/api/Notification`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar notificação: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao criar notificação:", error)
      throw error
    }
  }

  async markAsRead(id: number): Promise<Notification> {
    try {
      const updateData: UpdateNotificationData = {
        read: true,
        readAt: new Date().toISOString(),
      }

      const response = await fetch(`https://localhost:44394/api/Notification/${id}`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Erro ao marcar notificação como lida: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
      throw error
    }
  }

  async markAllAsRead(userId: number): Promise<void> {
    try {
      const data: MarkAllReadData = { userId }

      const response = await fetch(`https://localhost:44394/api/Notification/mark-all-read`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Erro ao marcar todas como lidas: ${response.status}`)
      }
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error)
      throw error
    }
  }

  async deleteNotification(id: number): Promise<void> {
    try {
      const response = await fetch(`https://localhost:44394/api/Notification/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erro ao deletar notificação: ${response.status}`)
      }
    } catch (error) {
      console.error("Erro ao deletar notificação:", error)
      throw error
    }
  }

  async getStats(userId?: number, start?: string, end?: string): Promise<NotificationStats> {
    try {
      const params = new URLSearchParams()

      if (userId) params.append("userId", userId.toString())
      if (start) params.append("start", start)
      if (end) params.append("end", end)

      const queryString = params.toString()
      const url = `https://localhost:44394/api/Notification/stats${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar estatísticas: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      throw error
    }
  }
}

export const notificationService = new NotificationService()
