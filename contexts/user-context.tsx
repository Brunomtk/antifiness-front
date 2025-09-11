"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

// Tipos baseados na API real
export interface User {
  id: number
  name: string
  username: string
  email: string
  role: "admin" | "client"
  status: "active" | "inactive"
  phone: string
  avatar: string
  createdAt: string
  updatedAt: string
  type: number // 1 = Admin, 2 = Client
  statusEnum: number // 1 = Active, 2 = Inactive
  clientId: number | null
  empresaId: number | null
}

interface UserState {
  currentUser: User | null
  users: User[]
  admins: User[]
  clients: User[]
  searchResults: User[]
  selectedUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  stats: any
  filters: any
}

type UserAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CREATING"; payload: boolean }
  | { type: "SET_UPDATING"; payload: boolean }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_ADMINS"; payload: User[] }
  | { type: "SET_CLIENTS"; payload: User[] }
  | { type: "SET_SEARCH_RESULTS"; payload: User[] }
  | { type: "SET_SELECTED_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "LOGOUT" }
  | { type: "SET_STATS"; payload: any }
  | { type: "SET_FILTERS"; payload: any }

interface UserContextType {
  state: UserState
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchUsers: (filters?: any) => Promise<void>
  fetchAdmins: () => Promise<void>
  fetchClients: () => Promise<void>
  createUser: (userData: CreateUserData) => Promise<void>
  updateUser: (id: number, userData: UpdateUserData) => Promise<void>
  deleteUser: (id: number) => Promise<void>
  searchUsers: (query: string) => Promise<void>
  setFilters: (filters: any) => void
  clearFilters: () => void
  selectUser: (user: User | null) => void
  clearError: () => void
  fetchStats: () => Promise<void>
}

interface RegisterData {
  name: string
  username: string
  email: string
  password: string
  phone: string
  avatar?: string
}

interface CreateUserData {
  name: string
  username: string
  email: string
  password: string
  type: number // 1 = Admin, 2 = Client
  status: number // 1 = Active, 2 = Inactive
  phone: string
  avatar?: string
  clientId?: number
  empresaId?: number
}

interface UpdateUserData {
  name: string
  username: string
  email: string
  password?: string
  type: number
  status: number
  phone: string
  avatar?: string
  clientId?: number
  empresaId?: number
}

interface LoginResponse {
  token: string
  refreshToken: string
}

interface ApiResponse {
  success: boolean
  message: string
}

// Estado inicial
const initialState: UserState = {
  currentUser: null,
  users: [],
  admins: [],
  clients: [],
  searchResults: [],
  selectedUser: null,
  isAuthenticated: false,
  isLoading: true,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  stats: null,
  filters: {},
}

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_CREATING":
      return { ...state, isCreating: action.payload }
    case "SET_UPDATING":
      return { ...state, isUpdating: action.payload }
    case "SET_DELETING":
      return { ...state, isDeleting: action.payload }
    case "SET_USER":
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case "SET_USERS":
      return { ...state, users: action.payload, isLoading: false }
    case "SET_ADMINS":
      return { ...state, admins: action.payload, isLoading: false }
    case "SET_CLIENTS":
      return { ...state, clients: action.payload, isLoading: false }
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload }
    case "SET_SELECTED_USER":
      return { ...state, selectedUser: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    case "SET_STATS":
      return { ...state, stats: action.payload }
    case "SET_FILTERS":
      return { ...state, filters: action.payload }
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      }
    default:
      return state
  }
}

// Context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://68.183.154.14:5000/api"

  // Função para obter headers com token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    }
  }

  // Função para verificar se o token é válido
  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch {
      return false
    }
  }

  // Função para extrair ID do token
  const getUserIdFromToken = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.sub
    } catch {
      return null
    }
  }

  // Função para fazer login
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      // 1. Fazer login
      const loginResponse = await fetch(`${API_BASE_URL}/Users/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!loginResponse.ok) {
        throw new Error("Credenciais inválidas")
      }

      const loginData: LoginResponse = await loginResponse.json()

      // 2. Salvar tokens
      localStorage.setItem("token", loginData.token)
      localStorage.setItem("refreshToken", loginData.refreshToken)

      // 3. Buscar dados do usuário
      const userId = getUserIdFromToken(loginData.token)
      if (!userId) {
        throw new Error("Token inválido")
      }

      const userResponse = await fetch(`${API_BASE_URL}/Users/${userId}`, {
        headers: {
          Authorization: `Bearer ${loginData.token}`,
          accept: "*/*",
        },
      })

      if (!userResponse.ok) {
        throw new Error("Erro ao buscar dados do usuário")
      }

      const userData: User = await userResponse.json()
      dispatch({ type: "SET_USER", payload: userData })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro no login"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      throw error
    }
  }

  // Função para fazer registro
  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: "SET_CREATING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      const response = await fetch(`${API_BASE_URL}/Users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error("Erro no registro")
      }

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Erro no registro")
      }

      dispatch({ type: "SET_CREATING", payload: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro no registro"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      dispatch({ type: "SET_CREATING", payload: false })
      throw error
    }
  }

  // Função para fazer logout
  const logout = async (): Promise<void> => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    dispatch({ type: "LOGOUT" })
  }

  // Função para buscar usuários
  const fetchUsers = async (filters?: any): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      const response = await fetch(`${API_BASE_URL}/Users`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar usuários")
      }

      const users: User[] = await response.json()
      dispatch({ type: "SET_USERS", payload: users })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar usuários"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }

  // Função para buscar admins
  const fetchAdmins = async (): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      const response = await fetch(`${API_BASE_URL}/Users`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar admins")
      }

      const users: User[] = await response.json()
      const admins = users.filter((user) => user.type === 1) // 1 = Admin
      dispatch({ type: "SET_ADMINS", payload: admins })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar admins"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }

  // Função para buscar clientes
  const fetchClients = async (): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      const response = await fetch(`${API_BASE_URL}/Users`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar clientes")
      }

      const users: User[] = await response.json()
      const clients = users.filter((user) => user.type === 2) // 2 = Client
      dispatch({ type: "SET_CLIENTS", payload: clients })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar clientes"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }

  // Função para criar usuário
  const createUser = async (userData: CreateUserData): Promise<void> => {
    dispatch({ type: "SET_CREATING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      const response = await fetch(`${API_BASE_URL}/Users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          avatar: userData.avatar || "",
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar usuário")
      }

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Erro ao criar usuário")
      }

      // Recarregar lista de usuários
      await fetchUsers()
      dispatch({ type: "SET_CREATING", payload: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar usuário"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      dispatch({ type: "SET_CREATING", payload: false })
      throw error
    }
  }

  // Função para atualizar usuário
  const updateUser = async (id: number, userData: UpdateUserData): Promise<void> => {
    dispatch({ type: "SET_UPDATING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar usuário")
      }

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Erro ao atualizar usuário")
      }

      // Se for o usuário atual, atualizar os dados
      if (state.currentUser && state.currentUser.id === id) {
        const updatedUser = { ...state.currentUser, ...userData }
        dispatch({ type: "SET_USER", payload: updatedUser })
      }

      // Recarregar lista de usuários
      await fetchUsers()
      dispatch({ type: "SET_UPDATING", payload: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar usuário"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      dispatch({ type: "SET_UPDATING", payload: false })
      throw error
    }
  }

  // Função para deletar usuário
  const deleteUser = async (id: number): Promise<void> => {
    dispatch({ type: "SET_DELETING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar usuário")
      }

      // Recarregar lista de usuários
      await fetchUsers()
      dispatch({ type: "SET_DELETING", payload: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar usuário"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      dispatch({ type: "SET_DELETING", payload: false })
      throw error
    }
  }

  // Função para buscar usuários
  const searchUsers = async (query: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "CLEAR_ERROR" })

    try {
      const response = await fetch(`${API_BASE_URL}/Users`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar usuários")
      }

      const users: User[] = await response.json()
      const filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase()),
      )

      dispatch({ type: "SET_SEARCH_RESULTS", payload: filteredUsers })
      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar usuários"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }

  // Função para definir filtros
  const setFilters = (filters: any): void => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }

  // Função para limpar filtros
  const clearFilters = (): void => {
    dispatch({ type: "SET_FILTERS", payload: {} })
  }

  // Função para selecionar usuário
  const selectUser = (user: User | null): void => {
    dispatch({ type: "SET_SELECTED_USER", payload: user })
  }

  // Função para limpar erro
  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  // Função para buscar estatísticas
  const fetchStats = async (): Promise<void> => {
    // Implementar quando a API tiver endpoint de estatísticas
    dispatch({ type: "SET_STATS", payload: {} })
  }

  // Verificar token ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token")

      if (!token || !isTokenValid(token)) {
        dispatch({ type: "SET_LOADING", payload: false })
        return
      }

      try {
        const userId = getUserIdFromToken(token)
        if (!userId) {
          throw new Error("Token inválido")
        }

        const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        })

        if (!response.ok) {
          throw new Error("Token inválido")
        }

        const userData: User = await response.json()
        dispatch({ type: "SET_USER", payload: userData })
      } catch (error) {
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    initializeAuth()
  }, [])

  const value: UserContextType = {
    state,
    login,
    register,
    logout,
    fetchUsers,
    fetchAdmins,
    fetchClients,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    setFilters,
    clearFilters,
    selectUser,
    clearError,
    fetchStats,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Hook para usar o contexto
export function useUserContext(): UserContextType {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}
