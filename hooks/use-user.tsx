"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { api } from "@/lib/api"

export interface User {
  id: number
  name: string
  email: string
  userType: "Admin" | "Client"
  userStatus: "Active" | "Inactive"
  clientId?: number
  empresaId?: number
  avatar?: string
  phone?: string
}

interface UserContextType {
  currentUser: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<boolean>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const context = useContext(UserContext)
  if (context) {
    return context
  }

  const createUserFromToken = (tokenPayload: any, email?: string): User => {
    console.log("🔍 === Analisando Token JWT ===")
    console.log("📋 Token payload completo:", JSON.stringify(tokenPayload, null, 2))

    // Extrair informações básicas do token
    const userId = Number.parseInt(tokenPayload.sub) || Number.parseInt(tokenPayload.nameid) || 0
    const userName = Array.isArray(tokenPayload.unique_name)
      ? tokenPayload.unique_name.join(" ")
      : tokenPayload.unique_name || tokenPayload.name || "Usuário"

    const userEmail = tokenPayload.email || email || ""
    const userType = tokenPayload.role === "client" || tokenPayload.userType === "Client" ? "Client" : "Admin"
    const userStatus = tokenPayload.status === "active" || tokenPayload.userStatus === "Active" ? "Active" : "Inactive"

    console.log("📊 Dados extraídos do token:")
    console.log("🆔 userId (sub):", userId)
    console.log("👤 userName:", userName)
    console.log("📧 userEmail:", userEmail)
    console.log("🏷️ userType:", userType)
    console.log("📊 userStatus:", userStatus)

    // Para clientes, extrair o clientId correto
    let clientId: number | undefined = undefined

    if (userType === "Client") {
      console.log("👤 Usuário é do tipo Client - buscando clientId...")

      // Listar todos os campos possíveis do token
      console.log("🔍 Campos disponíveis no token:", Object.keys(tokenPayload))

      // Tentar diferentes campos onde o clientId pode estar
      const possibleClientIds = [
        tokenPayload.clientId,
        tokenPayload.client_id,
        tokenPayload.ClientId,
        tokenPayload.clientid,
        tokenPayload.CLIENTID,
      ]

      console.log("🔍 Valores possíveis para clientId:", possibleClientIds)

      for (const possibleId of possibleClientIds) {
        if (possibleId !== undefined && possibleId !== null) {
          const parsedId = Number.parseInt(possibleId.toString())
          if (!isNaN(parsedId) && parsedId > 0) {
            clientId = parsedId
            console.log("✅ ClientId encontrado:", clientId, "do campo:", possibleId)
            break
          }
        }
      }

            // Se não encontrou clientId específico, **não** faça fallback para userId
      if (!clientId) {
        console.log("⚠️ ClientId não encontrado no token. Mantendo sem clientId (evitar usar userId como clientId).")
      }
    }

const user: User = {
      id: userId,
      name: userName,
      email: userEmail,
      userType,
      userStatus,
      clientId,
      avatar: tokenPayload.avatar,
      phone: tokenPayload.phone,
    }

    console.log("✅ === Usuário Final Criado ===")
    console.log("🆔 ID:", user.id)
    console.log("👤 Nome:", user.name)
    console.log("📧 Email:", user.email)
    console.log("🏷️ Tipo:", user.userType)
    console.log("📊 Status:", user.userStatus)
    console.log("🎯 ClientId:", user.clientId)
    console.log("================================")

    return user
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🚀 === INÍCIO LOGIN ===")
      console.log("📧 Email:", email)

      const response = await api.post("/Auth/login", {
        email,
        password,
      })

      if (response.data.token) {
        // Salvar token
        localStorage.setItem("token", response.data.token)

        console.log("🔑 Token recebido e salvo")

        // Decodificar token para obter informações do usuário
        const tokenPayload = JSON.parse(atob(response.data.token.split(".")[1]))

        const user = createUserFromToken(tokenPayload, email)
        setCurrentUser(user)
        // Enriquecer com dados do backend (/Users/{id}) para obter clientId/empresaId
        try {
          const userResp = await api.get(`/Users/${user.id}`)
          const apiUser = userResp.data || {}
          setCurrentUser({
            ...user,
            clientId: apiUser.clientId ?? user.clientId,
            empresaId: apiUser.empresaId ?? (apiUser.empresasId ?? (user as any).empresaId),
            phone: user.phone ?? apiUser.phone,
            avatar: user.avatar ?? apiUser.avatar,
          })
        } catch (enrichErr) {
          console.warn("⚠️ Não foi possível enriquecer usuário com /Users/{id}", enrichErr)
        }


        console.log("✅ === LOGIN CONCLUÍDO COM SUCESSO ===")
        return true
      }

      console.log("❌ Token não encontrado na resposta")
      return false
    } catch (err: any) {
      console.error("❌ Erro no login:", err)
      setError(err.response?.data?.message || "Erro ao fazer login")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("👋 === LOGOUT ===")
    localStorage.removeItem("token")
    setCurrentUser(null)
    setError(null)
  }

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!currentUser) return false

      setIsLoading(true)
      setError(null)

      console.log("🔄 === ATUALIZANDO USUÁRIO ===")
      console.log("📝 Dados para atualizar:", userData)

      if (currentUser.userType === "Client" && currentUser.clientId) {
        console.log("📡 Atualizando via endpoint Client:", currentUser.clientId)

        const response = await api.put(`/Client/${currentUser.clientId}`, userData)

        if (response.status === 200) {
          setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null))
          console.log("✅ Usuário atualizado com sucesso")
          return true
        }
      }

      console.log("❌ Falha na atualização")
      return false
    } catch (err: any) {
      console.error("❌ Erro ao atualizar usuário:", err)
      setError(err.response?.data?.message || "Erro ao atualizar dados")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      console.log("🔄 === REFRESH USER ===")

      const token = localStorage.getItem("token")
      if (!token) {
        console.log("❌ Token não encontrado no localStorage")
        setCurrentUser(null)
        setIsLoading(false)
        return
      }

      console.log("🔑 Token encontrado, decodificando...")

      // Verificar se o token ainda é válido
      const tokenPayload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000

      console.log("⏰ Verificando validade do token")
      console.log("📅 Token exp:", new Date(tokenPayload.exp * 1000).toLocaleString())
      console.log("📅 Tempo atual:", new Date(currentTime * 1000).toLocaleString())

      if (tokenPayload.exp < currentTime) {
        console.log("❌ Token expirado")
        logout()
        return
      }

      console.log("✅ Token válido, recriando usuário")

      const user = createUserFromToken(tokenPayload)
      setCurrentUser(user)
      // Enriquecer com dados do backend (/Users/{id}) para obter clientId/empresaId
      try {
        const userResp = await api.get(`/Users/${user.id}`)
        const apiUser = userResp.data || {}
        setCurrentUser(prev => ({
          ...(prev || user),
          clientId: apiUser.clientId ?? (prev as any)?.clientId,
          empresaId: apiUser.empresaId ?? (apiUser.empresasId ?? (prev as any)?.empresaId),
          phone: (prev as any)?.phone ?? apiUser.phone,
          avatar: (prev as any)?.avatar ?? apiUser.avatar,
        }))
      } catch (enrichErr) {
        console.warn("⚠️ Não foi possível enriquecer usuário com /Users/{id}", enrichErr)
      }


      console.log("✅ === REFRESH CONCLUÍDO ===")
    } catch (err) {
      console.error("❌ Erro ao verificar token:", err)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("🔄 === useEffect useUser ===")
    refreshUser()
  }, [])

  return {
    currentUser,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    refreshUser,
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const userHook = useUser()

  return <UserContext.Provider value={userHook}>{children}</UserContext.Provider>
}
