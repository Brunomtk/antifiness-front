"use client"

import { useContext } from "react"
import { MessageContext } from "@/contexts/message-context"
import type { MessageFilters } from "@/types/message"

export function useMessage() {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider")
  }
  return context
}

// Specific hooks for different aspects
export function useMessages() {
  const {
    state,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMessages,
    markMessagesAsRead,
    setMessageFilters,
    setSelectedMessages,
    clearSelection,
  } = useMessage()

  return {
    messages: state.messages,
    selectedMessages: state.selectedMessages,
    isLoading: state.isLoading,
    isSending: state.isSending,
    isLoadingMore: state.isLoadingMore,
    hasMoreMessages: state.hasMoreMessages,
    filters: state.messageFilters,
    error: state.error,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMessages,
    markMessagesAsRead,
    setFilters: setMessageFilters,
    setSelectedMessages,
    clearSelection,
  }
}

export function useConversations() {
  const {
    state,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversations,
    setCurrentConversation,
    setConversationFilters,
  } = useMessage()

  return {
    conversations: state.conversations,
    currentConversation: state.currentConversation,
    isLoading: state.isLoading,
    hasMoreConversations: state.hasMoreConversations,
    filters: state.conversationFilters,
    error: state.error,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversations,
    setCurrentConversation,
    setFilters: setConversationFilters,
  }
}

export function useMessageTemplates() {
  const { state, loadTemplates, createTemplate, updateTemplate, deleteTemplate, setTemplateFilters } = useMessage()

  return {
    templates: state.templates,
    filters: state.templateFilters,
    isLoading: state.isLoading,
    error: state.error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setFilters: setTemplateFilters,
  }
}

export function useMessageStats() {
  const { state, loadMessageStats, loadConversationStats } = useMessage()

  return {
    messageStats: state.messageStats,
    conversationStats: state.conversationStats,
    isLoading: state.isLoading,
    error: state.error,
    loadMessageStats,
    loadConversationStats,
  }
}

export function useRealTimeMessages() {
  const { state, connect, disconnect } = useMessage()

  return {
    isConnected: state.isConnected,
    onlineUsers: state.onlineUsers,
    connect,
    disconnect,
  }
}

// Utility hooks
export function useMessageOperations() {
  const { sendMessage, updateMessage, deleteMessage, markMessagesAsRead } = useMessage()

  return {
    sendMessage,
    updateMessage,
    deleteMessage,
    markMessagesAsRead,
  }
}

export function useConversationOperations() {
  const { createConversation, updateConversation, deleteConversation, setCurrentConversation } = useMessage()

  return {
    createConversation,
    updateConversation,
    deleteConversation,
    setCurrentConversation,
  }
}

// Computed values hooks
export function useUnreadCount() {
  const { state } = useMessage()

  const totalUnread = state.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0)

  const unreadByConversation = state.conversations.reduce(
    (acc, conversation) => {
      acc[conversation.id] = conversation.unreadCount
      return acc
    },
    {} as Record<number, number>,
  )

  return {
    totalUnread,
    unreadByConversation,
  }
}

export function useMessageSearch() {
  const { state, setMessageFilters } = useMessage()

  const searchMessages = (query: string, conversationId?: number) => {
    const filters: MessageFilters = {
      ...state.messageFilters,
      search: query,
      conversationId,
    }
    setMessageFilters(filters)
  }

  const clearSearch = () => {
    const filters: MessageFilters = {
      ...state.messageFilters,
      search: undefined,
    }
    setMessageFilters(filters)
  }

  return {
    searchQuery: state.messageFilters.search,
    searchMessages,
    clearSearch,
  }
}
