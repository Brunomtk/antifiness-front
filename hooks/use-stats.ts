"use client"

import { useState, useEffect, useCallback } from "react"
import { statsService } from "@/services/stats-service"
import type { DashboardStats, StatsFilters } from "@/types/stats"

export function useStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (filters?: StatsFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await statsService.getAllStats(filters)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas")
      console.error("Erro ao buscar estatísticas:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refreshStats,
    fetchStats,
  }
}

export function useClientStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (filters?: StatsFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await statsService.getClientStats(filters)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas de clientes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, fetchStats }
}

export function useCourseStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (filters?: StatsFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await statsService.getCourseStats(filters)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas de cursos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, fetchStats }
}

export function useDietStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (filters?: StatsFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await statsService.getDietStats(filters)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas de dietas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, fetchStats }
}

export function useWorkoutStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (filters?: StatsFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await statsService.getWorkoutStats(filters)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas de treinos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, fetchStats }
}

export function useFeedbackStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async (filters?: StatsFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await statsService.getFeedbackStats(filters)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas de feedbacks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, fetchStats }
}
