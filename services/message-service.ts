import type {
  Conversation,
  Message,
  MessageTemplate,
  CreateMessageRequest,
  UpdateMessageRequest,
  CreateConversationRequest,
  UpdateConversationRequest,
  AddParticipantRequest,
  UpdateParticipantRequest,
  MarkMessagesReadRequest,
  AddReactionRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  RenderTemplateRequest,
  ConversationsPagedResponse,
  MessagesPagedResponse,
  ConversationStatsResponse,
  MessageStatsResponse,
  RenderTemplateResponse,
  ConversationFilters,
  MessageFilters,
  TemplateFilters,
} from "@/types/message"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:44394/api"

class MessageService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Conversation methods
  async getConversations(filters: ConversationFilters = {}): Promise<ConversationsPagedResponse> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.request<ConversationsPagedResponse>(`/Conversation?${params}`)
  }

  async getConversation(id: number): Promise<Conversation> {
    return this.request<Conversation>(`/Conversation/${id}`)
  }

  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    return this.request<Conversation>("/Conversation", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateConversation(id: number, data: UpdateConversationRequest): Promise<Conversation> {
    return this.request<Conversation>(`/Conversation/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteConversation(id: number): Promise<void> {
    return this.request<void>(`/Conversation/${id}`, {
      method: "DELETE",
    })
  }

  async addParticipant(conversationId: number, data: AddParticipantRequest): Promise<void> {
    return this.request<void>(`/Conversation/${conversationId}/participants`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async removeParticipant(conversationId: number, userId: number): Promise<void> {
    return this.request<void>(`/Conversation/${conversationId}/participants/${userId}`, {
      method: "DELETE",
    })
  }

  async updateParticipant(conversationId: number, userId: number, data: UpdateParticipantRequest): Promise<void> {
    return this.request<void>(`/Conversation/${conversationId}/participants/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async archiveConversation(id: number): Promise<void> {
    return this.request<void>(`/Conversation/${id}/archive`, {
      method: "POST",
    })
  }

  async unarchiveConversation(id: number): Promise<void> {
    return this.request<void>(`/Conversation/${id}/unarchive`, {
      method: "POST",
    })
  }

  async muteConversation(id: number): Promise<void> {
    return this.request<void>(`/Conversation/${id}/mute`, {
      method: "POST",
    })
  }

  async unmuteConversation(id: number): Promise<void> {
    return this.request<void>(`/Conversation/${id}/unmute`, {
      method: "POST",
    })
  }

  async getConversationMessages(conversationId: number, page = 1, limit = 20): Promise<MessagesPagedResponse> {
    return this.request<MessagesPagedResponse>(`/Conversation/${conversationId}/messages?page=${page}&limit=${limit}`)
  }

  async markMessagesAsRead(conversationId: number, data: MarkMessagesReadRequest): Promise<void> {
    return this.request<void>(`/Conversation/${conversationId}/messages/read`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getConversationStats(id: number): Promise<ConversationStatsResponse> {
    return this.request<ConversationStatsResponse>(`/Conversation/${id}/stats`)
  }

  // Message methods
  async getMessages(filters: MessageFilters = {}): Promise<MessagesPagedResponse> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.request<MessagesPagedResponse>(`/Message?${params}`)
  }

  async getMessage(id: number): Promise<Message> {
    return this.request<Message>(`/Message/${id}`)
  }

  async sendMessage(data: CreateMessageRequest): Promise<Message> {
    return this.request<Message>("/Message", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateMessage(id: number, data: UpdateMessageRequest): Promise<Message> {
    return this.request<Message>(`/Message/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteMessage(id: number): Promise<void> {
    return this.request<void>(`/Message/${id}`, {
      method: "DELETE",
    })
  }

  async markMessageAsDelivered(id: number): Promise<void> {
    return this.request<void>(`/Message/${id}/delivered`, {
      method: "POST",
    })
  }

  async addReaction(messageId: number, data: AddReactionRequest): Promise<void> {
    return this.request<void>(`/Message/${messageId}/reactions`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async removeReaction(messageId: number, reactionId: number): Promise<void> {
    return this.request<void>(`/Message/${messageId}/reactions/${reactionId}`, {
      method: "DELETE",
    })
  }

  async searchMessages(search: string, conversationId?: number, page = 1, limit = 20): Promise<MessagesPagedResponse> {
    const params = new URLSearchParams({
      search,
      page: page.toString(),
      limit: limit.toString(),
    })

    if (conversationId) {
      params.append("conversationId", conversationId.toString())
    }

    return this.request<MessagesPagedResponse>(`/Message/search?${params}`)
  }

  async getMessageStats(empresasId?: number, from?: string, to?: string): Promise<MessageStatsResponse> {
    const params = new URLSearchParams()

    if (empresasId) params.append("empresasId", empresasId.toString())
    if (from) params.append("from", from)
    if (to) params.append("to", to)

    return this.request<MessageStatsResponse>(`/Message/stats?${params}`)
  }

  // Template methods
  async getTemplates(filters: TemplateFilters = {}): Promise<MessageTemplate[]> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    return this.request<MessageTemplate[]>(`/message-templates?${params}`)
  }

  async getTemplate(id: number): Promise<MessageTemplate> {
    return this.request<MessageTemplate>(`/message-templates/${id}`)
  }

  async createTemplate(data: CreateTemplateRequest): Promise<MessageTemplate> {
    return this.request<MessageTemplate>("/message-templates", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTemplate(id: number, data: UpdateTemplateRequest): Promise<MessageTemplate> {
    return this.request<MessageTemplate>(`/message-templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteTemplate(id: number): Promise<void> {
    return this.request<void>(`/message-templates/${id}`, {
      method: "DELETE",
    })
  }

  async renderTemplate(id: number, data: RenderTemplateRequest): Promise<RenderTemplateResponse> {
    return this.request<RenderTemplateResponse>(`/message-templates/${id}/render`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const messageService = new MessageService()
