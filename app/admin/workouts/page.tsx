"use client"

import Link from "next/link"
import * as React from "react"
import { Plus, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import WorkoutStatsCards from "@/components/workout/WorkoutStatsCards"
import WorkoutTable from "@/components/workout/WorkoutTable"
import WorkoutFiltersDialog from "@/components/workout/WorkoutFiltersDialog"
import { workoutService } from "@/services/workout-service"
import type { Workout } from "@/types/workout"
import { toast } from "@/components/ui/use-toast"

export default function WorkoutsPage() {
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<Workout[]>([])
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<any>({})
  const [openFilters, setOpenFilters] = React.useState(false)

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await workoutService.getPaged({ page, pageSize: 10, search, ...filters })
      setItems(res.workouts || [])
      setTotalPages(res.totalPages || 1)
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || "Erro ao carregar treinos"
      toast({ title: "Falha", description: String(msg) })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetch()
  }, [page, search, filters])

  return (
    <div className="flex flex-col gap-6">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Treinos</h1>
            <p className="text-orange-100">Crie e gerencie treinos e modelos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" asChild>
              <Link href="/admin/exercises">
                <Dumbbell className="mr-2 h-4 w-4" />
                Exercícios
              </Link>
            </Button>
            <Button asChild className="bg-white text-orange-700 hover:bg-orange-50">
              <Link href="/admin/workouts/create">
                <Plus className="mr-2 h-4 w-4" /> Novo Treino
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <WorkoutStatsCards />

      <WorkoutTable
        hideCreateButton
        items={items}
        loading={loading}
        onRefresh={fetch}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        onOpenFilters={() => setOpenFilters(true)}
      />

      <WorkoutFiltersDialog
        open={openFilters}
        onOpenChange={setOpenFilters}
        value={filters}
        onApply={(q) => {
          setFilters(q)
          setOpenFilters(false)
          setPage(1)
        }}
        onClear={() => setFilters({})}
      />
    </div>
  )
}
