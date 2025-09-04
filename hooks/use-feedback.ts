"use client"

import { useCallback } from "react"

import { useFeedback as useFeedbackContext } from "@/contexts/feedback-context"

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
          if (filters.type?.length) {
            filteredFeedbacks = filteredFeedbacks.filter((f) => filters.type!.includes(f.type))
          }
          if (filters.status?.length) {
            filteredFeedbacks = filteredFeedbacks.filter((f) => filters.status!.includes(f.status))
          }
          if (filters.priority?.length) {
            filteredFeedbacks = filteredFeedbacks.filter((f) => filters.priority!.includes(f.priority))
          }
          if (filters.search) {
            const search = filters.search.toLowerCase()
            filteredFeedbacks = filteredFeedbacks.filter(
              (f) => f.subject.toLowerCase().includes(search) || f.message.toLowerCase().includes(search),
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
    async (data: CreateFeedbackData) => {
      dispatch({ type: "SET_LOADING", payload: { key: "creating", value: true } })

      try {
        await delay(1000)

        const newFeedback: Feedback = {
          id: Date.now().toString(),
          ...data,
          nutritionistId: "nutri1",
          status: FeedbackStatus.OPEN,
          priority: FeedbackPriority.NORMAL,
          source: "app" as any,
          tags: data.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
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
    async (id: string, data: UpdateFeedbackData) => {
      dispatch({ type: "SET_LOADING", payload: { key: "updating", value: true } })

      try {
        await delay(800)

        const existingFeedback = state.feedbacks.find((f) => f.id === id)
        if (!existingFeedback) throw new Error("Feedback não encontrado")

        const updatedFeedback: Feedback = {
          ...existingFeedback,
          ...data,
          updatedAt: new Date(),
          resolvedAt: data.status === FeedbackStatus.RESOLVED ? new Date() : existingFeedback.resolvedAt,
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
    async (id: string) => {
      dispatch({ type: "SET_LOADING", payload: { key: "deleting", value: true } })

      try {
        await delay(500)
        dispatch({ type: "DELETE_FEEDBACK", payload: id })
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Erro ao deletar feedback" })
        throw error
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
    async (data: CreateResponseData) => {
      dispatch({ type: "SET_LOADING", payload: { key: "responding", value: true } })

      try {
        await delay(800)

        const newResponse: FeedbackResponse = {
          id: Date.now().toString(),
          ...data,
          responderId: "nutri1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        dispatch({ type: "ADD_RESPONSE", payload: newResponse })

        // Update feedback status
        const feedback = state.feedbacks.find((f) => f.id === data.feedbackId)
        if (feedback) {
          const updatedFeedback: Feedback = {
            ...feedback,
            status: FeedbackStatus.RESOLVED,
            updatedAt: new Date(),
            resolvedAt: new Date(),
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
          id: Date.now().toString(),
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
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

type Feedback = {
  id: string
  subject: string
  message: string
  type: string
  status: string
  priority: string
  nutritionistId: string
  source: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

type FeedbackResponse = {
  id: string
  feedbackId: string
  responderId: string
  message: string
  createdAt: Date
  updatedAt: Date
}

type FeedbackTemplate = {
  id: string
  name: string
  content: string
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

type CreateFeedbackData = {
  subject: string
  message: string
  type: string
  priority: string
  tags?: string[]
}

type UpdateFeedbackData = {
  subject?: string
  message?: string
  type?: string
  priority?: string
  status?: string
  tags?: string[]
}

type CreateResponseData = {
  feedbackId: string
  message: string
}

type FeedbackFilters = {
  type?: string[]
  status?: string[]
  priority?: string[]
  search?: string
}

enum FeedbackStatus {
  OPEN = "open",
  RESOLVED = "resolved",
}

enum FeedbackPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
}
