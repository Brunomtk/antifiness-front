"use client"

import { useEffect, useState } from "react"
import PlanTable from "@/components/plan/PlanTable"
import { planService } from "@/services/plan-service"
import type { Plan } from "@/types/plan"
import { toast } from "@/components/ui/use-toast"

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
    <div className="p-4 md:p-6 space-y-4">
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
