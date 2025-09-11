"use client"

import { useEffect, useState } from "react"
import PlanTable from "@/components/plan/PlanTable"
import { planService } from "@/services/plan-service"
import type { Plan } from "@/types/plan"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function PlansPage() {
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [items, setItems] = useState<Plan[]>([])
  const [search, setSearch] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await planService.getPaged(page, 20)
      setItems(res.results)
      setPageCount(res.pageCount || 1)
    } catch (error: any) {
      const message = error?.response?.data || error?.message || "Erro ao carregar planos"
      toast({ title: "Falha", description: String(message) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div className="flex flex-col gap-6">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
            <p className="text-purple-100">Gerencie os planos de assinatura da plataforma</p>
          </div>
          <Button asChild className="bg-white text-purple-700 hover:bg-purple-50">
            <Link href="/admin/plans/create">
              <Plus className="mr-2 h-4 w-4" /> Novo Plano
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Planos</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Planos Ativos</p>
                <p className="text-2xl font-bold">{items.filter((p) => p.isActive).length}</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Valor Médio</p>
                <p className="text-2xl font-bold">
                  R$ {items.length > 0 ? (items.reduce((acc, p) => acc + p.price, 0) / items.length).toFixed(0) : "0"}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Mais Popular</p>
                <p className="text-2xl font-bold">{items.find((p) => p.isPopular)?.name || "N/A"}</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PlanTable
        items={items}
        loading={loading}
        onRefresh={fetchData}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
      />
    </div>
  )
}
