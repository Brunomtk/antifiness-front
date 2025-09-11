"use client"

import { useCallback, useContext } from "react"
import { ClientContext } from "@/contexts/client-context"
import {
  clientService,
  type CreateClientRequest,
  type UpdateClientRequest,
  type WeightProgressRequest,
  type MeasurementProgressRequest,
  type PhotoProgressRequest,
  type AchievementRequest,
} from "@/services/client-service"
import {
  type Client,
  type CreateClientData,
  type UpdateClientData,
  type ClientFilters,
  ClientStatus,
  GoalType,
  Priority,
  ActivityLevel,
  KanbanStage,
} from "@/types/client"

export function useClients() {
  const context = useContext(ClientContext)

  if (!context) {
    throw new Error("useClients must be used within a ClientProvider")
  }

  const { state, dispatch } = context

  const fetchClients = useCallback(
    async (filters?: ClientFilters) => {
      dispatch({ type: "SET_LOADING", payload: { key: "clients", value: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        const apiFilters = {
          status: filters?.status,
          kanbanStage: filters?.kanbanStage,
          goalType: filters?.goalType,
          activityLevel: filters?.activityLevel,
          planId: filters?.planId,
          empresaId: filters?.empresaId || 1,
          search: filters?.search,
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 20,
          orderBy: filters?.orderBy || "name",
          orderDirection: filters?.orderDirection || "asc",
        }

        console.log("Buscando clientes com filtros:", apiFilters)
        const response = await clientService.getClients(apiFilters)
        console.log("Resposta da API:", response)

        dispatch({ type: "SET_CLIENTS", payload: response })
        return response
      } catch (error) {
        console.error("Erro no hook useClients:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao carregar clientes"
        dispatch({ type: "SET_ERROR", payload: errorMessage })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "clients", value: false } })
      }
    },
    [dispatch],
  )

  const fetchClientById = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_LOADING", payload: { key: "clients", value: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        console.log("Buscando cliente por ID:", id)
        const client = await clientService.getClientById(id)
        console.log("Cliente encontrado:", client)

        dispatch({ type: "SET_SELECTED_CLIENT", payload: client })
        return client
      } catch (error) {
        console.error("Erro ao buscar cliente por ID:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao carregar cliente"
        dispatch({ type: "SET_ERROR", payload: errorMessage })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "clients", value: false } })
      }
    },
    [dispatch],
  )

  const createClient = useCallback(
    async (data: CreateClientData) => {
      dispatch({ type: "SET_LOADING", payload: { key: "creating", value: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        const request: CreateClientRequest = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          height: data.height,
          currentWeight: data.currentWeight,
          targetWeight: data.targetWeight,
          activityLevel: data.activityLevel,
          empresaId: data.empresaId,
          goals: data.goals.map((goal) => ({
            type: goal.type,
            description: goal.description,
            targetValue: goal.targetValue,
            targetDate: goal.targetDate,
            priority: goal.priority,
            status: goal.status,
          })),
          measurements: data.measurements.map((measurement) => ({
            date: measurement.date,
            weight: measurement.weight,
            bodyFat: measurement.bodyFat || 0,
            muscleMass: measurement.muscleMass || 0,
            waist: measurement.waist || 0,
            chest: measurement.chest || 0,
            arms: measurement.arms || 0,
            thighs: measurement.thighs || 0,
            notes: measurement.notes,
          })),
          preferences: {
            dietaryRestrictions: data.preferences.dietaryRestrictions,
            favoriteFood: data.preferences.favoriteFood,
            dislikedFood: data.preferences.dislikedFood,
            mealTimes: {
              breakfast: data.preferences.mealTimes.breakfast,
              lunch: data.preferences.mealTimes.lunch,
              dinner: data.preferences.mealTimes.dinner,
              snacks: data.preferences.mealTimes.snacks,
            },
            workoutPreferences: {
              types: data.preferences.workoutPreferences.types,
              duration: data.preferences.workoutPreferences.duration,
              frequency: data.preferences.workoutPreferences.frequency,
              timeOfDay: data.preferences.workoutPreferences.timeOfDay,
            },
          },
          medicalConditions: data.medicalConditions,
          allergies: data.allergies,
        }

        console.log("Criando cliente:", request)
        const newClient = await clientService.createClient(request)
        console.log("Cliente criado:", newClient)

        dispatch({ type: "ADD_CLIENT", payload: newClient })
        return newClient
      } catch (error) {
        console.error("Erro ao criar cliente:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao criar cliente"
        dispatch({ type: "SET_ERROR", payload: errorMessage })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "creating", value: false } })
      }
    },
    [dispatch],
  )

  const updateClient = useCallback(
    async (id: number, data: UpdateClientData) => {
      dispatch({ type: "SET_LOADING", payload: { key: "updating", value: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        const request: UpdateClientRequest = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          height: data.height,
          currentWeight: data.currentWeight,
          targetWeight: data.targetWeight,
          activityLevel: data.activityLevel,
          empresaId: data.empresaId,
          status: data.status,
          kanbanStage: data.kanbanStage,
          planId: data.planId,
          goals: data.goals.map((goal) => ({
            type: goal.type,
            description: goal.description,
            targetValue: goal.targetValue,
            targetDate: goal.targetDate,
            priority: goal.priority,
            status: goal.status,
          })),
          measurements: data.measurements.map((measurement) => ({
            date: measurement.date,
            weight: measurement.weight,
            bodyFat: measurement.bodyFat || 0,
            muscleMass: measurement.muscleMass || 0,
            waist: measurement.waist || 0,
            chest: measurement.chest || 0,
            arms: measurement.arms || 0,
            thighs: measurement.thighs || 0,
            notes: measurement.notes,
          })),
          preferences: {
            dietaryRestrictions: data.preferences.dietaryRestrictions,
            favoriteFood: data.preferences.favoriteFood,
            dislikedFood: data.preferences.dislikedFood,
            mealTimes: {
              breakfast: data.preferences.mealTimes.breakfast,
              lunch: data.preferences.mealTimes.lunch,
              dinner: data.preferences.mealTimes.dinner,
              snacks: data.preferences.mealTimes.snacks,
            },
            workoutPreferences: {
              types: data.preferences.workoutPreferences.types,
              duration: data.preferences.workoutPreferences.duration,
              frequency: data.preferences.workoutPreferences.frequency,
              timeOfDay: data.preferences.workoutPreferences.timeOfDay,
            },
          },
          medicalConditions: data.medicalConditions,
          allergies: data.allergies,
        }

        console.log("Atualizando cliente:", id, request)
        await clientService.updateClient(id, request)

        // Buscar o cliente atualizado
        const updatedClient = await clientService.getClientById(id)
        console.log("Cliente atualizado:", updatedClient)

        dispatch({ type: "UPDATE_CLIENT", payload: updatedClient })
        return updatedClient
      } catch (error) {
        console.error("Erro ao atualizar cliente:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar cliente"
        dispatch({ type: "SET_ERROR", payload: errorMessage })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "updating", value: false } })
      }
    },
    [dispatch],
  )

  const deleteClient = useCallback(
    async (id: number) => {
      dispatch({ type: "SET_LOADING", payload: { key: "deleting", value: true } })
      dispatch({ type: "SET_ERROR", payload: null })

      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        console.log("Deletando cliente:", id)
        await clientService.deleteClient(id)
        console.log("Cliente deletado com sucesso")

        dispatch({ type: "DELETE_CLIENT", payload: id })
      } catch (error) {
        console.error("Erro ao deletar cliente:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao deletar cliente"
        dispatch({ type: "SET_ERROR", payload: errorMessage })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: { key: "deleting", value: false } })
      }
    },
    [dispatch],
  )

  const fetchStats = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "stats", value: true } })
    dispatch({ type: "SET_ERROR", payload: null })

    try {
      // Verificar se o usuário está autenticado
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Usuário não autenticado")
        }
      }

      console.log("Buscando estatísticas de clientes")
      const stats = await clientService.getClientStats()
      console.log("Estatísticas obtidas:", stats)

      dispatch({ type: "SET_STATS", payload: stats })
      return stats
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar estatísticas"
      dispatch({ type: "SET_ERROR", payload: errorMessage })

      // Se for erro de autenticação, redirecionar para login
      if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }

      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: { key: "stats", value: false } })
    }
  }, [dispatch])

  const addWeightProgress = useCallback(
    async (clientId: number, data: WeightProgressRequest) => {
      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        console.log("Adicionando progresso de peso:", clientId, data)
        const result = await clientService.addWeightProgress(clientId, data)
        console.log("Progresso de peso adicionado:", result)

        // Recarregar o cliente para atualizar os dados
        await fetchClientById(clientId)
        return result
      } catch (error) {
        console.error("Erro ao adicionar progresso de peso:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar progresso de peso"
        dispatch({
          type: "SET_ERROR",
          payload: errorMessage,
        })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      }
    },
    [dispatch, fetchClientById],
  )

  const addMeasurementProgress = useCallback(
    async (clientId: number, data: MeasurementProgressRequest) => {
      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        console.log("Adicionando medidas:", clientId, data)
        const result = await clientService.addMeasurementProgress(clientId, data)
        console.log("Medidas adicionadas:", result)

        // Recarregar o cliente para atualizar os dados
        await fetchClientById(clientId)
        return result
      } catch (error) {
        console.error("Erro ao adicionar medidas:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar medidas"
        dispatch({ type: "SET_ERROR", payload: errorMessage })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      }
    },
    [dispatch, fetchClientById],
  )

  const addPhotoProgress = useCallback(
    async (clientId: number, data: PhotoProgressRequest) => {
      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        console.log("Adicionando foto:", clientId, data)
        const result = await clientService.addPhotoProgress(clientId, data)
        console.log("Foto adicionada:", result)

        return result
      } catch (error) {
        console.error("Erro ao adicionar foto:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar foto"
        dispatch({ type: "SET_ERROR", payload: errorMessage })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      }
    },
    [dispatch],
  )

  const addAchievement = useCallback(
    async (clientId: number, data: AchievementRequest) => {
      try {
        // Verificar se o usuário está autenticado
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token")
          if (!token) {
            throw new Error("Usuário não autenticado")
          }
        }

        console.log("Adicionando conquista:", clientId, data)
        const result = await clientService.addAchievement(clientId, data)
        console.log("Conquista adicionada:", result)

        return result
      } catch (error) {
        console.error("Erro ao adicionar conquista:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro ao adicionar conquista"
        dispatch({ type: "SET_ERROR", payload: errorMessage })

        // Se for erro de autenticação, redirecionar para login
        if (errorMessage.includes("autenticação") || errorMessage.includes("autorizado")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }

        throw error
      }
    },
    [dispatch],
  )

  const selectClient = useCallback(
    (client: Client | null) => {
      dispatch({ type: "SET_SELECTED_CLIENT", payload: client })
    },
    [dispatch],
  )

  const setFilters = useCallback(
    (filters: ClientFilters) => {
      dispatch({ type: "SET_FILTERS", payload: filters })
    },
    [dispatch],
  )

  return {
    clients: state.clients,
    selectedClient: state.selectedClient,
    filters: state.filters,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
    fetchStats,
    addWeightProgress,
    addMeasurementProgress,
    addPhotoProgress,
    addAchievement,
    selectClient,
    setFilters,
  }
}

// Utilitários para facilitar o uso
export const useClientOperations = () => {
  const { createClient, updateClient, deleteClient } = useClients()
  return { createClient, updateClient, deleteClient }
}

export const useClientFilters = () => {
  const { setFilters, fetchClients, filters } = useClients()

  const applyFilters = useCallback(
    async (newFilters: ClientFilters) => {
      setFilters(newFilters)
      await fetchClients(newFilters)
    },
    [setFilters, fetchClients],
  )

  const clearFilters = useCallback(async () => {
    const emptyFilters: ClientFilters = {}
    setFilters(emptyFilters)
    await fetchClients(emptyFilters)
  }, [setFilters, fetchClients])

  return {
    filters,
    applyFilters,
    clearFilters,
  }
}

// Constantes úteis
export const GOAL_TYPE_OPTIONS = [
  { value: GoalType.WEIGHT_LOSS, label: "Perda de peso" },
  { value: GoalType.WEIGHT_GAIN, label: "Ganho de peso" },
  { value: GoalType.MUSCLE_GAIN, label: "Ganho de massa" },
  { value: GoalType.MAINTENANCE, label: "Manutenção" },
  { value: GoalType.HEALTH_IMPROVEMENT, label: "Melhoria da saúde" },
  { value: GoalType.PERFORMANCE, label: "Performance" },
]

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: ActivityLevel.SEDENTARY, label: "Sedentário" },
  { value: ActivityLevel.LIGHT, label: "Leve" },
  { value: ActivityLevel.MODERATE, label: "Moderado" },
  { value: ActivityLevel.ACTIVE, label: "Ativo" },
  { value: ActivityLevel.VERY_ACTIVE, label: "Muito ativo" },
]

export const PRIORITY_OPTIONS = [
  { value: Priority.LOW, label: "Baixa" },
  { value: Priority.MEDIUM, label: "Média" },
  { value: Priority.HIGH, label: "Alta" },
]

export const CLIENT_STATUS_OPTIONS = [
  { value: ClientStatus.ACTIVE, label: "Ativo" },
  { value: ClientStatus.INACTIVE, label: "Inativo" },
  { value: ClientStatus.PAUSED, label: "Pausado" },
]

export const KANBAN_STAGE_OPTIONS = [
  { value: KanbanStage.LEAD, label: "Lead" },
  { value: KanbanStage.PROSPECT, label: "Prospect" },
  { value: KanbanStage.ACTIVE, label: "Ativo" },
  { value: KanbanStage.INACTIVE, label: "Inativo" },
  { value: KanbanStage.COMPLETED, label: "Concluído" },
]

export const useClient = useClients
