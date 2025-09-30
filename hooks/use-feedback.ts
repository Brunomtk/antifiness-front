"use client"

import { useCallback } from "react"

import {
  type Feedback,
  type CreateFeedbackRequest,
  type UpdateFeedbackData,
  type FeedbackFilters,
  FeedbackStatus,
} from "@/types/feedback"
import { useFeedback as useFeedbackContext } from "@/contexts/feedback-context"

interface FeedbackResponse {
  id: number
  feedbackId: number
  responderId: number
  message: string
  createdDate: string
  updatedDate: string
}

interface FeedbackTemplate {
  id: number
  title: string
  content: string
  category: string
  usageCount: number
  createdAt: string
  updatedAt: string
}

export function useFeedback() {
  return useFeedbackContext()
}

export function useFeedbacks() {
  const { state, dispatch } = useFeedback()

  const fetchFeedbacks = useCallback(
    async (filters?: FeedbackFilters) => {
      dispatch({ type: "SET_LOADING", payload: { key: "feedbacks", value: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        await delay(1000)

        let filteredFeedbacks = state.feedbacks

        if (filters) {
          if (filters.type !== undefined) {
            filteredFeedbacks = filteredFeedbacks.filter((f) => f.type === filters.type)
          }
          if (filters.status !== undefined) {
            filteredFeedbacks = filteredFeedbacks.filter((f) => f.status === filters.status)
          }
          if (filters.category !== undefined) {
            filteredFeedbacks = filteredFeedbacks.filter((f) => f.category === filters.category)
          }
          if (filters.search) {
            const search = filters.search.toLowerCase()
            filteredFeedbacks = filteredFeedbacks.filter(
              (f) => f.title.toLowerCase().includes(search) || f.description.toLowerCase().includes(search),
            )
          }
        }

        dispatch({ type: "SET_FEEDBACKS", payload: filteredFeedbacks })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao carregar feedbacks" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "feedbacks", value: false } })
      }
    },
    [state.feedbacks, dispatch],
  )

  const createFeedback = useCallback(
    async (data: CreateFeedbackRequest) => {
      dispatch({ type: "SET_LOADING", payload: { key: "creating", value: true } })

      try {
        await delay(1000)

        const newFeedback: Feedback = {
          id: Date.now(),
          clientId: 1,
          clientName: "Cliente Teste",
          trainerId: 1,
          trainerName: "Trainer Teste",
          type: data.type,
          typeName: "Tipo Teste",
          category: data.category,
          categoryName: "Categoria Teste",
          title: data.title,
          description: data.description,
          rating: data.rating,
          status: FeedbackStatus.PENDING,
          statusName: "Pendente",
          adminResponse: null,
          responseDate: null,
          attachmentUrl: data.attachmentUrl || null,
          isAnonymous: data.isAnonymous,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        }

        dispatch({ type: "ADD_FEEDBACK", payload: newFeedback })
        return newFeedback
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao criar feedback" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "creating", value: false } })
      }
    },
    [dispatch],
  )

  const updateFeedback = useCallback(
    async (id: number, data: UpdateFeedbackData) => {
      dispatch({ type: "SET_LOADING", payload: { key: "updating", value: true } })

      try {
        await delay(800)

        const existingFeedback = state.feedbacks.find((f) => f.id === id)
        if (!existingFeedback) throw new Error("Feedback não encontrado")

        const updatedFeedback: Feedback = {
          ...existingFeedback,
          ...data,
          updatedDate: new Date().toISOString(),
          responseDate: data.adminResponse ? new Date().toISOString() : existingFeedback.responseDate,
        }

        dispatch({ type: "UPDATE_FEEDBACK", payload: updatedFeedback })
        return updatedFeedback
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao atualizar feedback" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "updating", value: false } })
      }
    },
    [state.feedbacks, dispatch],
  )

  const deleteFeedback = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_LOADING", payload: { key: "deleting", value: true } })

      try {
        await delay(500)
        dispatch({ type: "DELETE_FEEDBACK", payload: id })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao deletar feedback" })
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "deleting", value: false } })
      }
    },
    [dispatch],
  )

  const selectFeedback = useCallback(
    (feedback: Feedback | null) => {
      dispatch({ type: "SET_SELECTED_FEEDBACK", payload: feedback })
    },
    [dispatch],
  )

  const setFilters = useCallback(
    (filters: FeedbackFilters) => {
      dispatch({ type: "SET_FILTERS", payload: filters })
    },
    [dispatch],
  )

  return {
    feedbacks: state.feedbacks,
    selectedFeedback: state.selectedFeedback,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    fetchFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    selectFeedback,
    setFilters,
  }
}

export function useFeedbackResponses() {
  const { state, dispatch } = useFeedback()

  const createResponse = useCallback(
    async (data: { feedbackId: number; message: string }) => {
      dispatch({ type: "SET_LOADING", payload: { key: "responding", value: true } })

      try {
        await delay(800)

        const newResponse: FeedbackResponse = {
          id: Date.now(),
          feedbackId: data.feedbackId,
          responderId: 1,
          message: data.message,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        }

        dispatch({ type: "ADD_RESPONSE", payload: newResponse })

        // Update feedback status
        const feedback = state.feedbacks.find((f) => f.id === data.feedbackId)
        if (feedback) {
          const updatedFeedback: Feedback = {
            ...feedback,
            status: FeedbackStatus.RESOLVED,
            updatedDate: new Date().toISOString(),
            responseDate: new Date().toISOString(),
          }
          dispatch({ type: "UPDATE_FEEDBACK", payload: updatedFeedback })
        }

        return newResponse
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao criar resposta" })
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "responding", value: false } })
      }
    },
    [state.feedbacks, dispatch],
  )

  return {
    responses: state.responses,
    loading: state.loading.responding,
    error: state.error,
    createResponse,
  }
}

export function useFeedbackTemplates() {
  const { state, dispatch } = useFeedback()

  const fetchTemplates = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "templates", value: true } })

    try {
      await delay(500)
      dispatch({ type: "SET_TEMPLATES", payload: state.templates })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar templates" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "templates", value: false } })
    }
  }, [state.templates, dispatch])

  const createTemplate = useCallback(
    async (data: Omit<FeedbackTemplate, "id" | "usageCount" | "createdAt" | "updatedAt">) => {
      try {
        await delay(500)

        const newTemplate: FeedbackTemplate = {
          ...data,
          id: Date.now(),
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        dispatch({ type: "ADD_TEMPLATE", payload: newTemplate })
        return newTemplate
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao criar template" })
        throw error
      }
    },
    [dispatch],
  )

  return {
    templates: state.templates,
    loading: state.loading.templates,
    error: state.error,
    fetchTemplates,
    createTemplate,
  }
}

export function useFeedbackStats() {
  const { state, dispatch } = useFeedback()

  const fetchStats = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "stats", value: true } })

    try {
      await delay(800)

      if (state.stats) {
        dispatch({ type: "SET_STATS", payload: state.stats })
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Erro ao carregar estatísticas" })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "stats", value: false } })
    }
  }, [state.stats, dispatch])

  return {
    stats: state.stats,
    loading: state.loading.stats,
    error: state.error,
    fetchStats,
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
