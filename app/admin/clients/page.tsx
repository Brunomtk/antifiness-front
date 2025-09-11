"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import ClientTable from "@/components/client/ClientTable"
import FiltersDialog from "@/components/client/FiltersDialog"
import StatsCards from "@/components/client/StatsCards"
import { clientService } from "@/services/client-service"
import type { Client } from "@/types/client"

export default function ClientsPage() {
  const [loading, setLoading] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [pageCount, setPageCount] = React.useState(1)
  const [items, setItems] = React.useState<Client[]>([])
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState({
    status: undefined as any,
    kanbanStage: undefined as any,
    activityLevel: undefined as any,
    orderBy: "name" as "name" | "createdDate" | "updatedDate",
    orderDirection: "asc" as "asc" | "desc",
    startDate: "",
    endDate: "",
  })
  const [openFilters, setOpenFilters] = React.useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await clientService.getPaged({ page, pageSize: 20, search, ...filters })
      setItems(res.results)
      setPageCount(res.pageCount || (res as any).totalPages || 1)
    } catch (error: any) {
      const message = error?.response?.data || error?.message || "Erro ao carregar clientes"
      toast({ title: "Falha", description: String(message) })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, search])

  return (
    <div className="flex flex-col gap-6">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-blue-100">Gerencie seus clientes, status e permissões</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" asChild>
              <Link href="/admin/clients/crm">Abrir CRM</Link>
            </Button>
            <Button asChild className="bg-white text-blue-700 hover:bg-blue-50">
              <Link href="/admin/clients/create">
                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <StatsCards />
      <ClientTable
        hideCreateButton
        items={items}
        loading={loading}
        onRefresh={fetchData}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        onOpenFilters={() => setOpenFilters(true)}
      />
      <FiltersDialog
        open={openFilters}
        onOpenChange={setOpenFilters}
        value={filters}
        onApply={(q) => {
          setFilters(q as any)
          setOpenFilters(false)
          setPage(1)
        }}
        onClear={() => {
          setFilters({
            status: undefined,
            kanbanStage: undefined,
            activityLevel: undefined,
            orderBy: "name",
            orderDirection: "asc",
            startDate: "",
            endDate: "",
          } as any)
        }}
      />
    </div>
  )
}
