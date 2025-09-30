import type {
  Notification,
  NotificationStats,
  CreateNotificationData,
  UpdateNotificationData,
  MarkAllReadData,
  NotificationFilters,
  NotificationBatch,
} from "@/types/notification"
import { api } from "@/lib/api"

class NotificationService {
  async getNotifications(filters?: NotificationFilters): Promise<NotificationBatch> {
    try {
      const params = new URLSearchParams()

      if (filters?.type && Array.isArray(filters.type)) {
        filters.type.forEach((t) => params.append("Type", t.toString()))
      } else if (filters?.type) {
        params.append("Type", filters.type.toString())
      }

      if (filters?.category && Array.isArray(filters.category)) {
        filters.category.forEach((c) => params.append("Category", c.toString()))
      } else if (filters?.category) {
        params.append("Category", filters.category.toString())
      }

      if (filters?.priority && Array.isArray(filters.priority)) {
        filters.priority.forEach((p) => params.append("Priority", p.toString()))
      } else if (filters?.priority) {
        params.append("Priority", filters.priority.toString())
      }

      if (filters?.read !== undefined) params.append("Read", filters.read.toString())
      if (filters?.start) params.append("StartDate", filters.start)
      if (filters?.end) params.append("EndDate", filters.end)
      if (filters?.search) params.append("Search", filters.search)
      if (filters?.page) params.append("Page", filters.page.toString())
      if (filters?.limit) params.append("Limit", filters.limit.toString())

      const queryString = params.toString()

      const response = await api.get(`/Notification${queryString ? `?${queryString}` : ""}`)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
      throw error
    }
  }

  async getNotificationById(id: number): Promise<Notification> {
    try {
      const response = await api.get(`/Notification/${id}`)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar notificação:", error)
      throw error
    }
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const response = await api.post("/Notification", data)
      return response.data
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

      const response = await api.patch(`/Notification/${id}`, updateData)
      return response.data
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
      throw error
    }
  }

  async markAllAsRead(userId: number): Promise<void> {
    try {
      const data: MarkAllReadData = { userId }

      await api.post("/Notification/mark-all-read", data)
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error)
      throw error
    }
  }

  async deleteNotification(id: number): Promise<void> {
    try {
      await api.delete(`/Notification/${id}`)
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

      const response = await api.get(`/Notification/stats${queryString ? `?${queryString}` : ""}`)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      throw error
    }
  }
}

export const notificationService = new NotificationService()
