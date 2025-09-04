"use client"

import { useState, useCallback } from "react"
import { progressService } from "@/services/progress-service"
import type {
  LessonProgress,
  UpdateProgressData,
  ProgressFilters,
  CourseProgressSummary,
  UserProgressStats,
} from "@/types/progress"

export function useProgress() {
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [loading, setLoading] = useState({
    fetching: false,
    updating: false,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async (filters: ProgressFilters) => {
    setLoading((prev) => ({ ...prev, fetching: true }))
    setError(null)

    try {
      const progressData = await progressService.getProgress(filters)
      setProgress(progressData)
      return progressData
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar progresso")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, fetching: false }))
    }
  }, [])

  const updateProgress = useCallback(async (data: UpdateProgressData) => {
    setLoading((prev) => ({ ...prev, updating: true }))
    setError(null)

    try {
      const updatedProgress = await progressService.updateProgress(data)

      // Atualizar o estado local
      setProgress((prev) => {
        const existingIndex = prev.findIndex(
          (p) => p.enrollmentId === data.enrollmentId && p.lessonId === data.lessonId,
        )

        if (existingIndex >= 0) {
          // Atualizar progresso existente
          const newProgress = [...prev]
          newProgress[existingIndex] = updatedProgress
          return newProgress
        } else {
          // Adicionar novo progresso
          return [...prev, updatedProgress]
        }
      })

      return updatedProgress
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar progresso")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }))
    }
  }, [])

  const markLessonComplete = useCallback(
    async (enrollmentId: number, lessonId: number, watchTimeMinutes = 0) => {
      return updateProgress({
        enrollmentId,
        lessonId,
        isCompleted: true,
        watchTimeMinutes,
      })
    },
    [updateProgress],
  )

  const markLessonIncomplete = useCallback(
    async (enrollmentId: number, lessonId: number, watchTimeMinutes = 0) => {
      return updateProgress({
        enrollmentId,
        lessonId,
        isCompleted: false,
        watchTimeMinutes,
      })
    },
    [updateProgress],
  )

  const updateWatchTime = useCallback(
    async (enrollmentId: number, lessonId: number, watchTimeMinutes: number, isCompleted = false) => {
      return updateProgress({
        enrollmentId,
        lessonId,
        isCompleted,
        watchTimeMinutes,
      })
    },
    [updateProgress],
  )

  return {
    progress,
    loading,
    error,
    fetchProgress,
    updateProgress,
    markLessonComplete,
    markLessonIncomplete,
    updateWatchTime,
  }
}

export function useCourseProgress() {
  const [courseProgress, setCourseProgress] = useState<CourseProgressSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCourseProgress = useCallback(async (userId: number, courseId: number) => {
    setLoading(true)
    setError(null)

    try {
      const progressData = await progressService.getCourseProgress(userId, courseId)
      setCourseProgress(progressData)
      return progressData
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar progresso do curso")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    courseProgress,
    loading,
    error,
    fetchCourseProgress,
  }
}

export function useUserProgressStats() {
  const [userStats, setUserStats] = useState<UserProgressStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserStats = useCallback(async (userId: number) => {
    setLoading(true)
    setError(null)

    try {
      const statsData = await progressService.getUserProgressStats(userId)
      setUserStats(statsData)
      return statsData
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas do usuário")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    userStats,
    loading,
    error,
    fetchUserStats,
  }
}
