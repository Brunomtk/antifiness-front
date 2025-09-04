"use client"

import type React from "react"
import { createContext, useReducer, useCallback, useEffect } from "react"
import { messageService } from "@/services/message-service"
import {
  type Message,
  type Conversation,
  type MessageTemplate,
  type MessageFilters,
  type ConversationFilters,
  type TemplateFilters,
  type CreateMessageRequest,
  type UpdateMessageRequest,
  type CreateConversationRequest,
  type UpdateConversationRequest,
  type ConversationStatsResponse,
  type MessageStatsResponse,
  MessageStatus,
  type CreateTemplateRequest,
  type UpdateTemplateRequest,
} from "@/types/message"

interface MessageState {
  // Data
  messages: Message[]
  conversations: Conversation[]
  templates: MessageTemplate[]

  // Current state
  currentConversation: Conversation | null
  selectedMessages: number[]

  // UI state
  isLoading: boolean
  isSending: boolean
  isLoadingMore: boolean
  error: string | null

  // Filters & pagination
  messageFilters: MessageFilters
  conversationFilters: ConversationFilters
  templateFilters: TemplateFilters
  hasMoreMessages: boolean
  hasMoreConversations: boolean

  // Stats
  messageStats: MessageStatsResponse | null
  conversationStats: Record<number, ConversationStatsResponse>

  // Real-time
  isConnected: boolean
  onlineUsers: number[]
}

type MessageAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SENDING"; payload: boolean }
  | { type: "SET_LOADING_MORE"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_MESSAGE"; payload: { id: number; data: Partial<Message> } }
  | { type: "DELETE_MESSAGE"; payload: number }
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "ADD_CONVERSATION"; payload: Conversation }
  | { type: "UPDATE_CONVERSATION"; payload: { id: number; data: Partial<Conversation> } }
  | { type: "DELETE_CONVERSATION"; payload: number }
  | { type: "SET_CURRENT_CONVERSATION"; payload: Conversation | null }
  | { type: "SET_SELECTED_MESSAGES"; payload: number[] }
  | { type: "SET_MESSAGE_FILTERS"; payload: MessageFilters }
  | { type: "SET_CONVERSATION_FILTERS"; payload: ConversationFilters }
  | { type: "SET_TEMPLATE_FILTERS"; payload: TemplateFilters }
  | { type: "SET_HAS_MORE_MESSAGES"; payload: boolean }
  | { type: "SET_HAS_MORE_CONVERSATIONS"; payload: boolean }
  | { type: "SET_MESSAGE_STATS"; payload: MessageStatsResponse }
  | { type: "SET_CONVERSATION_STATS"; payload: { conversationId: number; stats: ConversationStatsResponse } }
  | { type: "SET_TEMPLATES"; payload: MessageTemplate[] }
  | { type: "ADD_TEMPLATE"; payload: MessageTemplate }
  | { type: "UPDATE_TEMPLATE"; payload: { id: number; data: Partial<MessageTemplate> } }
  | { type: "DELETE_TEMPLATE"; payload: number }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_ONLINE_USERS"; payload: number[] }
  | { type: "MARK_MESSAGES_READ"; payload: { conversationId: number; messageIds: number[] } }

const initialState: MessageState = {
  messages: [],
  conversations: [],
  templates: [],
  currentConversation: null,
  selectedMessages: [],
  isLoading: false,
  isSending: false,
  isLoadingMore: false,
  error: null,
  messageFilters: {},
  conversationFilters: {},
  templateFilters: {},
  hasMoreMessages: true,
  hasMoreConversations: true,
  messageStats: null,
  conversationStats: {},
  isConnected: false,
  onlineUsers: [],
}

function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_SENDING":
      return { ...state, isSending: action.payload }
    case "SET_LOADING_MORE":
      return { ...state, isLoadingMore: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_MESSAGES":
      return { ...state, messages: action.payload }
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      }
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.payload.id ? { ...message, ...action.payload.data } : message,
        ),
      }
    case "DELETE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((message) => message.id !== action.payload),
      }
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload }
    case "ADD_CONVERSATION":
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      }
    case "UPDATE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.payload.id ? { ...conversation, ...action.payload.data } : conversation,
        ),
      }
    case "DELETE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter((conversation) => conversation.id !== action.payload),
      }
    case "SET_CURRENT_CONVERSATION":
      return { ...state, currentConversation: action.payload }
    case "SET_SELECTED_MESSAGES":
      return { ...state, selectedMessages: action.payload }
    case "SET_MESSAGE_FILTERS":
      return { ...state, messageFilters: action.payload }
    case "SET_CONVERSATION_FILTERS":
      return { ...state, conversationFilters: action.payload }
    case "SET_TEMPLATE_FILTERS":
      return { ...state, templateFilters: action.payload }
    case "SET_HAS_MORE_MESSAGES":
      return { ...state, hasMoreMessages: action.payload }
    case "SET_HAS_MORE_CONVERSATIONS":
      return { ...state, hasMoreConversations: action.payload }
    case "SET_MESSAGE_STATS":
      return { ...state, messageStats: action.payload }
    case "SET_CONVERSATION_STATS":
      return {
        ...state,
        conversationStats: {
          ...state.conversationStats,
          [action.payload.conversationId]: action.payload.stats,
        },
      }
    case "SET_TEMPLATES":
      return { ...state, templates: action.payload }
    case "ADD_TEMPLATE":
      return { ...state, templates: [...state.templates, action.payload] }
    case "UPDATE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.map((template) =>
          template.id === action.payload.id ? { ...template, ...action.payload.data } : template,
        ),
      }
    case "DELETE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.filter((template) => template.id !== action.payload),
      }
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload }
    case "SET_ONLINE_USERS":
      return { ...state, onlineUsers: action.payload }
    case "MARK_MESSAGES_READ":
      return {
        ...state,
        messages: state.messages.map((message) =>
          action.payload.messageIds.includes(message.id)
            ? { ...message, status: MessageStatus.READ, readAt: new Date().toISOString() }
            : message,
        ),
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.payload.conversationId ? { ...conversation, unreadCount: 0 } : conversation,
        ),
      }
    default:
      return state
  }
}

interface MessageContextType {
  state: MessageState

  // Message operations
  sendMessage: (data: CreateMessageRequest) => Promise<void>
  updateMessage: (id: number, data: UpdateMessageRequest) => Promise<void>
  deleteMessage: (id: number) => Promise<void>
  loadMessages: (conversationId: number, page?: number) => Promise<void>
  markMessagesAsRead: (conversationId: number, messageIds: number[], userId: number) => Promise<void>

  // Conversation operations
  createConversation: (data: CreateConversationRequest) => Promise<void>
  updateConversation: (id: number, data: UpdateConversationRequest) => Promise<void>
  deleteConversation: (id: number) => Promise<void>
  loadConversations: (filters?: ConversationFilters) => Promise<void>
  setCurrentConversation: (conversation: Conversation | null) => void

  // Template operations
  loadTemplates: (filters?: TemplateFilters) => Promise<void>
  createTemplate: (data: CreateTemplateRequest) => Promise<void>
  updateTemplate: (id: number, data: UpdateTemplateRequest) => Promise<void>
  deleteTemplate: (id: number) => Promise<void>

  // Stats
  loadMessageStats: (empresasId?: number, from?: string, to?: string) => Promise<void>
  loadConversationStats: (conversationId: number) => Promise<void>

  // Filters
  setMessageFilters: (filters: MessageFilters) => void
  setConversationFilters: (filters: ConversationFilters) => void
  setTemplateFilters: (filters: TemplateFilters) => void

  // Selection
  setSelectedMessages: (messageIds: number[]) => void
  clearSelection: () => void

  // Real-time
  connect: () => void
  disconnect: () => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, initialState)

  // Message operations
  const sendMessage = useCallback(async (data: CreateMessageRequest) => {
    dispatch({ type: "SET_SENDING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const newMessage = await messageService.sendMessage(data)
      dispatch({ type: "ADD_MESSAGE", payload: newMessage })

      // Update conversation last message
      dispatch({
        type: "UPDATE_CONVERSATION",
        payload: {
          id: data.conversationId,
          data: {
            lastMessage: newMessage,
            updatedAt: new Date().toISOString(),
          },
        },
      })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao enviar mensagem" })
    } finally {
      dispatch({ type: "SET_SENDING", payload: false })
    }
  }, [])

  const updateMessage = useCallback(async (id: number, data: UpdateMessageRequest) => {
    try {
      const updatedMessage = await messageService.updateMessage(id, data)
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: { id, data: updatedMessage },
      })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao atualizar mensagem" })
    }
  }, [])

  const deleteMessage = useCallback(async (id: number) => {
    try {
      await messageService.deleteMessage(id)
      dispatch({ type: "DELETE_MESSAGE", payload: id })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao deletar mensagem" })
    }
  }, [])

  const loadMessages = useCallback(
    async (conversationId: number, page = 1) => {
      if (page === 1) {
        dispatch({ type: "SET_LOADING", payload: true })
      } else {
        dispatch({ type: "SET_LOADING_MORE", payload: true })
      }

      try {
        const response = await messageService.getConversationMessages(conversationId, page)

        if (page === 1) {
          dispatch({ type: "SET_MESSAGES", payload: response.messages })
        } else {
          // Para páginas adicionais, adicionar às mensagens existentes
          dispatch({ type: "SET_MESSAGES", payload: [...state.messages, ...response.messages] })
        }

        dispatch({ type: "SET_HAS_MORE_MESSAGES", payload: response.hasMore })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao carregar mensagens" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
        dispatch({ type: "SET_LOADING_MORE", payload: false })
      }
    },
    [state.messages],
  )

  const markMessagesAsRead = useCallback(async (conversationId: number, messageIds: number[], userId: number) => {
    try {
      await messageService.markMessagesAsRead(conversationId, { messageIds, userId })
      dispatch({ type: "MARK_MESSAGES_READ", payload: { conversationId, messageIds } })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro ao marcar mensagens como lidas",
      })
    }
  }, [])

  // Conversation operations
  const createConversation = useCallback(async (data: CreateConversationRequest) => {
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const newConversation = await messageService.createConversation(data)
      dispatch({ type: "ADD_CONVERSATION", payload: newConversation })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao criar conversa" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const updateConversation = useCallback(async (id: number, data: UpdateConversationRequest) => {
    try {
      const updatedConversation = await messageService.updateConversation(id, data)
      dispatch({ type: "UPDATE_CONVERSATION", payload: { id, data: updatedConversation } })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao atualizar conversa" })
    }
  }, [])

  const deleteConversation = useCallback(async (id: number) => {
    try {
      await messageService.deleteConversation(id)
      dispatch({ type: "DELETE_CONVERSATION", payload: id })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao deletar conversa" })
    }
  }, [])

  const loadConversations = useCallback(async (filters: ConversationFilters = {}) => {
    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const response = await messageService.getConversations(filters)
      dispatch({ type: "SET_CONVERSATIONS", payload: response.conversations })
      dispatch({ type: "SET_HAS_MORE_CONVERSATIONS", payload: response.hasMore })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao carregar conversas" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const setCurrentConversation = useCallback((conversation: Conversation | null) => {
    dispatch({ type: "SET_CURRENT_CONVERSATION", payload: conversation })
  }, [])

  // Template operations
  const loadTemplates = useCallback(async (filters: TemplateFilters = {}) => {
    try {
      const templates = await messageService.getTemplates(filters)
      dispatch({ type: "SET_TEMPLATES", payload: templates })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao carregar templates" })
    }
  }, [])

  const createTemplate = useCallback(async (data: CreateTemplateRequest) => {
    try {
      const newTemplate = await messageService.createTemplate(data)
      dispatch({ type: "ADD_TEMPLATE", payload: newTemplate })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao criar template" })
    }
  }, [])

  const updateTemplate = useCallback(async (id: number, data: UpdateTemplateRequest) => {
    try {
      const updatedTemplate = await messageService.updateTemplate(id, data)
      dispatch({ type: "UPDATE_TEMPLATE", payload: { id, data: updatedTemplate } })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao atualizar template" })
    }
  }, [])

  const deleteTemplate = useCallback(async (id: number) => {
    try {
      await messageService.deleteTemplate(id)
      dispatch({ type: "DELETE_TEMPLATE", payload: id })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao deletar template" })
    }
  }, [])

  // Stats
  const loadMessageStats = useCallback(async (empresasId?: number, from?: string, to?: string) => {
    try {
      const stats = await messageService.getMessageStats(empresasId, from, to)
      dispatch({ type: "SET_MESSAGE_STATS", payload: stats })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error instanceof Error ? error.message : "Erro ao carregar estatísticas" })
    }
  }, [])

  const loadConversationStats = useCallback(async (conversationId: number) => {
    try {
      const stats = await messageService.getConversationStats(conversationId)
      dispatch({ type: "SET_CONVERSATION_STATS", payload: { conversationId, stats } })
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Erro ao carregar estatísticas da conversa",
      })
    }
  }, [])

  // Filters
  const setMessageFilters = useCallback((filters: MessageFilters) => {
    dispatch({ type: "SET_MESSAGE_FILTERS", payload: filters })
  }, [])

  const setConversationFilters = useCallback((filters: ConversationFilters) => {
    dispatch({ type: "SET_CONVERSATION_FILTERS", payload: filters })
  }, [])

  const setTemplateFilters = useCallback((filters: TemplateFilters) => {
    dispatch({ type: "SET_TEMPLATE_FILTERS", payload: filters })
  }, [])

  // Selection
  const setSelectedMessages = useCallback((messageIds: number[]) => {
    dispatch({ type: "SET_SELECTED_MESSAGES", payload: messageIds })
  }, [])

  const clearSelection = useCallback(() => {
    dispatch({ type: "SET_SELECTED_MESSAGES", payload: [] })
  }, [])

  // Real-time
  const connect = useCallback(() => {
    dispatch({ type: "SET_CONNECTED", payload: true })
  }, [])

  const disconnect = useCallback(() => {
    dispatch({ type: "SET_CONNECTED", payload: false })
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const value: MessageContextType = {
    state,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMessages,
    markMessagesAsRead,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversations,
    setCurrentConversation,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    loadMessageStats,
    loadConversationStats,
    setMessageFilters,
    setConversationFilters,
    setTemplateFilters,
    setSelectedMessages,
    clearSelection,
    connect,
    disconnect,
  }

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
}

export { MessageContext }
