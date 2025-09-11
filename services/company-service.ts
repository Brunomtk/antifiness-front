import { api } from "@/lib/api"

export interface Company {
  id: number
  name: string
  email: string
  cnpj: string
  status: number
  statusText: string
  userId: number
  userName: string
  userEmail: string
  createdDate: string
  updatedDate: string
}

export const companyService = {
  async getCompanies(params?: {
    name?: string
    status?: string
    search?: string
    page?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: string
  }): Promise<{
    result: Company[]
    currentPage: number
    pageSize: number
    rowCount: number
    pageCount: number
  }> {
    const searchParams = new URLSearchParams()
    if (params?.name) searchParams.append("name", params.name)
    if (params?.status) searchParams.append("status", params.status)
    if (params?.search) searchParams.append("search", params.search)
    searchParams.append("page", (params?.page || 1).toString())
    searchParams.append("pageSize", (params?.pageSize || 10).toString())
    searchParams.append("sortBy", params?.sortBy || "Name")
    searchParams.append("sortDirection", params?.sortDirection || "asc")

    const { data } = await api.get(`/Empresas?${searchParams.toString()}`)
    return data
  },

  async getCompany(id: number): Promise<Company> {
    const { data } = await api.get(`/Empresas/${id}`)
    return data
  },
}

export const CompanyService = companyService
