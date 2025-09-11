"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { exerciseService } from "@/services/exercise-service"
import { Search, Dumbbell, Plus, ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSelect: (exercise: { id: number; name: string; difficulty?: number; category?: number }) => void
}

export default function ExercisesPicker({ open, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<any[]>([])
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await exerciseService.getPaged({ page, pageSize: 12, search })
      setItems(res.exercises || [])
      setTotalPages(res.totalPages || 1)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (open) fetch()
  }, [open, page, search])

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-yellow-100 text-yellow-800",
      3: "bg-red-100 text-red-800",
    }
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getDifficultyLabel = (difficulty: number) => {
    const labels = { 1: "Iniciante", 2: "Intermediário", 3: "Avançado" }
    return labels[difficulty as keyof typeof labels] || "—"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Dumbbell className="h-6 w-6 text-orange-600" />
            Escolher Exercício
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar exercícios por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-8 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((ex) => (
                  <Card
                    key={`ex-${ex.id}`}
                    className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{ex.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            {ex.difficulty && (
                              <Badge className={getDifficultyColor(ex.difficulty)}>
                                {getDifficultyLabel(ex.difficulty)}
                              </Badge>
                            )}
                            {ex.category && <Badge variant="outline">Categoria {ex.category}</Badge>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            onSelect({ id: ex.id, name: ex.name, difficulty: ex.difficulty, category: ex.category })
                            onOpenChange(false)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum exercício encontrado</h3>
                <p className="text-gray-600">Tente ajustar sua busca ou verifique a ortografia.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Página <span className="font-semibold">{page}</span> de{" "}
              <span className="font-semibold">{totalPages || 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages || loading}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
