"use client"

import { useState, useCallback } from "react"
import { UserService } from "@/services/user-service"
import type { User, CreateUserData, UpdateUserData } from "@/types/user"
import { toast } from "@/components/ui/use-toast"

interface UserStats {
  totalUsers: number
  totalAdmins: number
  totalClients: number
  activeUsers: number
  inactiveUsers: number
  pendingUsers: number
  newUsersThisMonth: number
  verifiedAdmins: number
  clientsWithNutritionist: number
  growthPercentage: number
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = useCallback(
    async (params?: {
      role?: string
      status?: string
      search?: string
      page?: number
      pageSize?: number
    }) => {
      try {
        setLoading(true)
        const response = await UserService.getUsers(params)
        setUsers(response.users)
        return response
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await UserService.getUserStats()
      setStats(response)
      return response
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const createUser = useCallback(
    async (data: CreateUserData) => {
      try {
        setCreating(true)
        const response = await UserService.createUser(data)
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso",
        })
        await fetchUsers()
        await fetchUserStats()
        return response
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o usuário",
          variant: "destructive",
        })
        throw error
      } finally {
        setCreating(false)
      }
    },
    [fetchUsers, fetchUserStats],
  )

  const updateUser = useCallback(
    async (id: number, data: UpdateUserData) => {
      try {
        setUpdating(true)
        const response = await UserService.updateUser(id, data)
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        })
        await fetchUsers()
        await fetchUserStats()
        return response
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o usuário",
          variant: "destructive",
        })
        throw error
      } finally {
        setUpdating(false)
      }
    },
    [fetchUsers, fetchUserStats],
  )

  const deleteUser = useCallback(
    async (id: number) => {
      try {
        setDeleting(true)
        const response = await UserService.deleteUser(id)
        toast({
          title: "Sucesso",
          description: "Usuário removido com sucesso",
        })
        await fetchUsers()
        await fetchUserStats()
        return response
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover o usuário",
          variant: "destructive",
        })
        throw error
      } finally {
        setDeleting(false)
      }
    },
    [fetchUsers, fetchUserStats],
  )

  return {
    users,
    stats,
    loading,
    creating,
    updating,
    deleting,
    fetchUsers,
    fetchUserStats,
    createUser,
    updateUser,
    deleteUser,
  }
}
