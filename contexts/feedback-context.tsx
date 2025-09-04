"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import { feedbackService } from "@/services/feedback-service"
import type { Feedback, FeedbackFilters, FeedbackStats, CreateFeedbackData, UpdateFeedbackData } from "@/types/feedback"

interface FeedbackState {
  feedbacks: Feedback[]
  selectedFeedback: Feedback | null
  stats: FeedbackStats | null
  filters: FeedbackFilters
  pagination: {
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  loading: {
    feedbacks: boolean
    stats: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
  }
  error: string | null
}

type FeedbackAction =
  | { type: "SET_LOADING"; payload: { key: keyof FeedbackState["loading"]; value: boolean } }
  | { type: "SET_FEEDBACKS"; payload: Feedback[] }
  | { type: "SET_SELECTED_FEEDBACK"; payload: Feedback | null }
  | { type: "SET_STATS"; payload: FeedbackStats }
  | { type: "SET_FILTERS"; payload: FeedbackFilters }
  | { type: "SET_PAGINATION"; payload: FeedbackState["pagination"] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_FEEDBACK"; payload: Feedback }
  | { type: "UPDATE_FEEDBACK"; payload: Feedback }
  | { type: "DELETE_FEEDBACK"; payload: number }

interface FeedbackContextType {
  state: FeedbackState
  dispatch: React.Dispatch<FeedbackAction>
  fetchFeedbacks: (filters?: FeedbackFilters) => Promise<void>
  fetchFeedbackById: (id: number) => Promise<void>
  createFeedback: (data: CreateFeedbackData) => Promise<void>
  updateFeedback: (id: number, data: UpdateFeedbackData) => Promise<void>
  deleteFeedback: (id: number) => Promise<void>
  fetchFeedbackStats: () => Promise<void>
  setFilters: (filters: FeedbackFilters) => void
  clearError: () => void
}

const initialState: FeedbackState = {
  feedbacks: [],
  selectedFeedback: null,
  stats: null,
  filters: {
    pageNumber: 1,
    pageSize: 10,
  },
  pagination: {
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
  loading: {
    feedbacks: false,
    stats: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
}

function feedbackReducer(state: FeedbackState, action: FeedbackAction): FeedbackState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      }
    case "SET_FEEDBACKS":
      return {
        ...state,
        feedbacks: action.payload,
        loading: { ...state.loading, feedbacks: false },
      }
    case "SET_SELECTED_FEEDBACK":
      return {
        ...state,
        selectedFeedback: action.payload,
      }
    case "SET_STATS":
      return {
        ...state,
        stats: action.payload,
        loading: { ...state.loading, stats: false },
      }
    case "SET_FILTERS":
      return {
        ...state,
        filters: action.payload,
      }
    case "SET_PAGINATION":
      return {
        ...state,
        pagination: action.payload,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: {
          feedbacks: false,
          stats: false,
          creating: false,
          updating: false,
          deleting: false,
        },
      }
    case "ADD_FEEDBACK":
      return {
        ...state,
        feedbacks: [action.payload, ...state.feedbacks],
        loading: { ...state.loading, creating: false },
      }
    case "UPDATE_FEEDBACK":
      return {
        ...state,
        feedbacks: state.feedbacks.map((feedback) => (feedback.id === action.payload.id ? action.payload : feedback)),
        selectedFeedback: state.selectedFeedback?.id === action.payload.id ? action.payload : state.selectedFeedback,
        loading: { ...state.loading, updating: false },
      }
    case "DELETE_FEEDBACK":
      return {
        ...state,
        feedbacks: state.feedbacks.filter((feedback) => feedback.id !== action.payload),
        selectedFeedback: state.selectedFeedback?.id === action.payload ? null : state.selectedFeedback,
        loading: { ...state.loading, deleting: false },
      }
    default:
      return state
  }
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(feedbackReducer, initialState)

  const fetchFeedbacks = useCallback(async (filters?: FeedbackFilters) => {
    dispatch({ type: "SET_LOADING", payload: { key: "feedbacks", value: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const response = await feedbackService.getFeedbacks(filters)
      dispatch({ type: "SET_FEEDBACKS", payload: response.feedbacks })
      dispatch({
        type: "SET_PAGINATION",
        payload: {
          totalCount: response.totalCount,
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          hasPreviousPage: response.hasPreviousPage,
          hasNextPage: response.hasNextPage,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar feedbacks"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [])

  const fetchFeedbackById = useCallback(async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: { key: "feedbacks", value: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const feedback = await feedbackService.getFeedbackById(id)
      dispatch({ type: "SET_SELECTED_FEEDBACK", payload: feedback })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar feedback"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "feedbacks", value: false } })
    }
  }, [])

  const createFeedback = useCallback(async (data: CreateFeedbackData) => {
    dispatch({ type: "SET_LOADING", payload: { key: "creating", value: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const newFeedback = await feedbackService.createFeedback(data)
      dispatch({ type: "ADD_FEEDBACK", payload: newFeedback })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar feedback"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }, [])

  const updateFeedback = useCallback(async (id: number, data: UpdateFeedbackData) => {
    dispatch({ type: "SET_LOADING", payload: { key: "updating", value: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const updatedFeedback = await feedbackService.updateFeedback(id, data)
      dispatch({ type: "UPDATE_FEEDBACK", payload: updatedFeedback })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar feedback"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }, [])

  const deleteFeedback = useCallback(async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: { key: "deleting", value: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      await feedbackService.deleteFeedback(id)
      dispatch({ type: "DELETE_FEEDBACK", payload: id })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar feedback"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }, [])

  const fetchFeedbackStats = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "stats", value: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      const stats = await feedbackService.getFeedbackStats()
      dispatch({ type: "SET_STATS", payload: stats })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar estatísticas"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [])

  const setFilters = useCallback((filters: FeedbackFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null })
  }, [])

  const value: FeedbackContextType = {
    state,
    dispatch,
    fetchFeedbacks,
    fetchFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    fetchFeedbackStats,
    setFilters,
    clearError,
  }

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (context === undefined) {
    throw new Error("useFeedback must be used within a FeedbackProvider")
  }
  return context
}
