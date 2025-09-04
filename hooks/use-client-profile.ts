"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { UserService } from "@/services/user-service"
import type { User, UpdateUserData } from "@/types/user"

export function useClientProfile() {
  const { currentUser } = useUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar dados do perfil
  const fetchProfile = async () => {
    if (!currentUser?.id) return

    try {
      setIsLoading(true)
      setError(null)
      const userData = await UserService.getUser(currentUser.id)
      setProfile(userData)
    } catch (err) {
      console.error("Erro ao buscar perfil:", err)
      setError("Erro ao carregar dados do perfil")
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar perfil
  const updateProfile = async (data: Partial<UpdateUserData>) => {
    if (!currentUser?.id) {
      throw new Error("Usuário não autenticado")
    }

    try {
      setIsUpdating(true)
      setError(null)

      const updateData: UpdateUserData = {
        name: data.name || profile?.name || "",
        username: data.username || profile?.username || "",
        email: data.email || profile?.email || "",
        type: profile?.type || 0,
        status: profile?.statusEnum || 1,
        phone: data.phone || profile?.phone,
        avatar: data.avatar || profile?.avatar,
        clientId: profile?.clientId,
        empresaId: profile?.empresaId,
      }

      await UserService.updateUser(currentUser.id, updateData)

      // Atualizar estado local
      setProfile((prev) => (prev ? { ...prev, ...data } : null))

      return { success: true, message: "Perfil atualizado com sucesso!" }
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err)
      const errorMessage = "Erro ao atualizar perfil"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  // Upload de avatar
  const uploadAvatar = async (file: File) => {
    try {
      setIsUpdating(true)
      const avatarUrl = await UserService.uploadAvatar(file)
      await updateProfile({ avatar: avatarUrl })
      return avatarUrl
    } catch (err) {
      console.error("Erro ao fazer upload do avatar:", err)
      throw new Error("Erro ao fazer upload da imagem")
    }
  }

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (currentUser?.id) {
      fetchProfile()
    }
  }, [currentUser?.id])

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  }
}
