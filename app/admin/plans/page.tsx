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

  const avgPrice = items.length > 0
    ? (items.reduce((acc, p) => acc + ((((p as any)?.price ?? 0) as number)), 0) / items.length)
    : 0

  const mostPopularName = ((items as any[])?.find((p) => (p as any)?.isPopular)?.name as string) ?? "N/A"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
        <Link href="/admin/plans/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-4 text-white">
          <p className="text-purple-100 text-sm font-medium">Total de Planos</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-4 text-white">
          <p className="text-orange-100 text-sm font-medium">Valor Médio</p>
          <p className="text-2xl font-bold">R$ {avgPrice.toFixed(0)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-4 text-white">
          <p className="text-pink-100 text-sm font-medium">Mais Popular</p>
          <p className="text-2xl font-bold">{mostPopularName}</p>
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
