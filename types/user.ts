export interface User {
  id: number
  name: string
  username: string
  email: string
  role: string
  status: string
  phone?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  type: number
  statusEnum: number
  clientId: number
  empresaId: number
}

export interface CreateUserData {
  name: string
  username: string
  email: string
  password: string
  type: number
  status: number
  phone?: string
  avatar?: string
  clientId?: number
  empresaId?: number
}

export interface UpdateUserData {
  name: string
  username: string
  email: string
  password?: string
  type: number
  status: number
  phone?: string
  avatar?: string
  clientId?: number
  empresaId?: number
}

export interface UserResponse {
  user: User
  token: string
}

export interface ApiResponse {
  success: boolean
  message: string
  data?: any
}

export enum UserType {
  CLIENT = 0,
  ADMIN = 1,
}

export enum UserStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  PENDING = 2,
  SUSPENDED = 3,
}

export function getUserTypeLabel(type: number): string {
  switch (type) {
    case UserType.CLIENT:
      return "Cliente"
    case UserType.ADMIN:
      return "Administrador"
    default:
      return "Desconhecido"
  }
}

export function getUserStatusLabel(status: number): string {
  switch (status) {
    case UserStatus.INACTIVE:
      return "Inativo"
    case UserStatus.ACTIVE:
      return "Ativo"
    case UserStatus.PENDING:
      return "Pendente"
    case UserStatus.SUSPENDED:
      return "Suspenso"
    default:
      return "Desconhecido"
  }
}
