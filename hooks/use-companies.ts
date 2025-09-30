"use client"

import { useState, useCallback } from "react"
import { companyService, type Company } from "@/services/company-service"

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const data = await companyService.getCompanies()
      setCompanies(data.result)
    } catch (error) {
      console.error("Erro ao carregar empresas:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    companies,
    loading,
    fetchCompanies,
  }
}
