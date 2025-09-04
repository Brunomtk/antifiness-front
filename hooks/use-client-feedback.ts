"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import type { Feedback, CreateFeedbackRequest } from "@/types/feedback"

interface UseClientFeedbackState {
  feedbacks: Feedback[]
  loading: {
    feedbacks: boolean
    creating: boolean
    updating: boolean
  }
  error: {
    feedbacks: string | null
    creating: string | null
    general: string | null
  }
}

interface UseClientFeedbackActions {
  loadFeedbacks: () => Promise<void>
  createFeedback: (data: CreateFeedbackRequest) => Promise<boolean>
  clearError: (key?: keyof UseClientFeedbackState["error"]) => void
  refreshFeedbacks: () => Promise<void>
}

type UseClientFeedbackReturn = UseClientFeedbackState & UseClientFeedbackActions

export function useClientFeedback(): UseClientFeedbackReturn {
  const [state, setState] = useState<UseClientFeedbackState>({
    feedbacks: [],
    loading: {
      feedbacks: false,
      creating: false,
      updating: false,
    },
    error: {
      feedbacks: null,
      creating: null,
      general: null,
    },
  })

  // Buscar dados do usuário logado
  const getCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token não encontrado")

      const payload = JSON.parse(atob(token.split(".")[1]))
      const userId = payload.sub

      const response = await api.get(`/Users/${userId}`)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return null
    }
  }, [])

  const loadFeedbacks = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, feedbacks: true },
      error: { ...prev.error, feedbacks: null },
    }))

    try {
      const user = await getCurrentUser()
      if (!user || !user.clientId) {
        throw new Error("Usuário não é um cliente válido")
      }

      // Usar o endpoint específico para feedbacks do cliente
      const response = await api.get(`/Feedback/client/${user.clientId}`)

      setState((prev) => ({
        ...prev,
        feedbacks: response.data || [],
        loading: { ...prev.loading, feedbacks: false },
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, feedbacks: false },
        error: {
          ...prev.error,
          feedbacks: error instanceof Error ? error.message : "Erro ao carregar feedbacks",
        },
      }))
    }
  }, [getCurrentUser])

  const createFeedback = useCallback(
    async (data: CreateFeedbackRequest): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, creating: true },
        error: { ...prev.error, creating: null },
      }))

      try {
        const user = await getCurrentUser()
        if (!user || !user.clientId) {
          throw new Error("Usuário não é um cliente válido")
        }

        // Preparar dados para envio
        const feedbackData = {
          clientId: user.clientId,
          trainerId: user.trainerId || 1, // Usar trainerId do usuário ou padrão
          type: data.type,
          category: data.category,
          title: data.title,
          description: data.description,
          rating: data.rating,
          attachmentUrl: data.attachmentUrl || "",
          isAnonymous: data.isAnonymous || false,
        }

        await api.post("/Feedback", feedbackData)

        // Recarregar feedbacks após criar
        await loadFeedbacks()

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, creating: false },
        }))

        return true
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, creating: false },
          error: {
            ...prev.error,
            creating: error instanceof Error ? error.message : "Erro ao criar feedback",
          },
        }))
        return false
      }
    },
    [getCurrentUser, loadFeedbacks],
  )

  const clearError = useCallback((key?: keyof UseClientFeedbackState["error"]) => {
    setState((prev) => ({
      ...prev,
      error: key ? { ...prev.error, [key]: null } : { feedbacks: null, creating: null, general: null },
    }))
  }, [])

  const refreshFeedbacks = useCallback(async () => {
    await loadFeedbacks()
  }, [loadFeedbacks])

  // Carregar dados iniciais
  useEffect(() => {
    loadFeedbacks()
  }, [loadFeedbacks])

  return {
    ...state,
    loadFeedbacks,
    createFeedback,
    clearError,
    refreshFeedbacks,
  }
}
