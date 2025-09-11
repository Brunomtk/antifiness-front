import { api } from "@/lib/api"

export interface Company {
  id: number
  name: string
  description?: string
  isActive: boolean
}

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    const { data } = await api.get("/Empresas")
    return data
  },

  async getCompany(id: number): Promise<Company> {
    const { data } = await api.get(`/Empresas/${id}`)
    return data
  },
}

export const CompanyService = companyService
