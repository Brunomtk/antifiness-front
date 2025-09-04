"use client"

import * as React from "react"
import Link from "next/link"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RefreshCcw, Filter, Eye, Pencil, Trash, Dumbbell, Clock, Flame } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { workoutService } from "@/services/workout-service"
import type { Workout } from "@/types/workout"

export type WorkoutTableProps = {
  items: Workout[]
  hideCreateButton?: boolean
  loading?: boolean
  onRefresh?: () => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  search: string
  onSearchChange: (q: string) => void
  onOpenFilters?: () => void
}

export default function WorkoutTable({
  items,
  loading,
  onRefresh,
  page,
  totalPages,
  onPageChange,
  search,
  onSearchChange,
  onOpenFilters,
  hideCreateButton = false,
}: WorkoutTableProps) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((d) => d.name.toLowerCase().includes(q) || (d.tags || []).join(",").toLowerCase().includes(q))
  }, [items, search])

  const [deleteTarget, setDeleteTarget] = React.useState<Workout | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await workoutService.remove(deleteTarget.id)
      toast({ title: "Treino excluído" })
      setDeleteTarget(null)
      onRefresh?.()
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: number) => {
    const statusMap: Record<number, { label: string; className: string }> = {
      0: { label: "Rascunho", className: "bg-gray-500 text-white shadow-md" },
      1: { label: "Ativo", className: "bg-green-500 text-white shadow-md" },
      2: { label: "Concluído", className: "bg-blue-500 text-white shadow-md" },
      3: { label: "Arquivado", className: "bg-amber-500 text-white shadow-md" },
    }
    const config = statusMap[status] || { label: "Desconhecido", className: "bg-muted text-foreground" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getTypeBadge = (type: number) => {
    const typeMap: Record<number, { label: string; className: string }> = {
      1: { label: "Força", className: "bg-red-100 text-red-700 border-red-200" },
      2: { label: "Hipertrofia", className: "bg-purple-100 text-purple-700 border-purple-200" },
      3: { label: "HIIT", className: "bg-orange-100 text-orange-700 border-orange-200" },
      4: { label: "Cardio", className: "bg-blue-100 text-blue-700 border-blue-200" },
      5: { label: "Mobilidade", className: "bg-green-100 text-green-700 border-green-200" },
    }
    const config = typeMap[type] || { label: "-", className: "bg-muted text-muted-foreground" }
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getDifficultyBadge = (difficulty: number) => {
    const difficultyMap: Record<number, { label: string; className: string }> = {
      1: { label: "Iniciante", className: "bg-green-100 text-green-700 border-green-200" },
      2: { label: "Intermediário", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      3: { label: "Avançado", className: "bg-red-100 text-red-700 border-red-200" },
    }
    const config = difficultyMap[difficulty] || { label: "-", className: "bg-muted text-muted-foreground" }
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <TooltipProvider>
      <Card className="border-none shadow-lg bg-gradient-to-b from-background to-muted/20">
        <CardHeader className="flex items-center justify-between flex-row bg-gradient-to-r from-background to-muted/30 rounded-t-lg">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Treinos
          </CardTitle>
          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nome/tags..."
              className="w-[280px] bg-background/80 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50"
            />
            <Button
              variant="outline"
              onClick={() => onOpenFilters?.()}
              className="bg-background/80 backdrop-blur-sm hover:bg-muted/80"
            >
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
            <Button
              variant="secondary"
              onClick={onRefresh}
              disabled={loading}
              className="bg-background/80 backdrop-blur-sm hover:bg-muted/80"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-lg border-x border-b border-muted-foreground/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/60 border-b border-muted-foreground/10">
                  <TableHead className="font-semibold text-foreground">Nome</TableHead>
                  <TableHead className="font-semibold text-foreground">Tipo</TableHead>
                  <TableHead className="font-semibold text-foreground">Dificuldade</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Duração</TableHead>
                  <TableHead className="font-semibold text-foreground">Calorias</TableHead>
                  <TableHead className="font-semibold text-foreground">Tags</TableHead>
                  <TableHead className="font-semibold text-foreground">Modelo?</TableHead>
                  <TableHead className="text-right pr-6 font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((w) => (
                  <TableRow
                    key={`workout-${w.id}`}
                    className="hover:bg-muted/30 transition-colors border-b border-muted-foreground/5"
                  >
                    <TableCell className="font-semibold text-foreground py-4">{w.name}</TableCell>
                    <TableCell>{w.type ? getTypeBadge(w.type) : "-"}</TableCell>
                    <TableCell>{w.difficulty ? getDifficultyBadge(w.difficulty) : "-"}</TableCell>
                    <TableCell>{getStatusBadge(w.status ?? 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{w.estimatedDuration ?? "-"} min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Flame className="h-3 w-3" />
                        <span>{w.estimatedCalories ?? "-"} kcal</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {(w.tags || []).slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-muted/60 text-foreground">
                            {tag}
                          </Badge>
                        ))}
                        {(w.tags || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs bg-muted/60 text-muted-foreground">
                            +{(w.tags || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={w.isTemplate ? "default" : "secondary"}
                        className={w.isTemplate ? "bg-primary/10 text-primary" : ""}
                      >
                        {w.isTemplate ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            >
                              <Link href={`/admin/workouts/${w.id}/`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver treino</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8 hover:bg-green-100 hover:text-green-600 transition-colors"
                            >
                              <Link href={`/admin/workouts/${w.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar treino</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteTarget(w)}
                                  className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-colors"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir treino?</AlertDialogTitle>
                                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {deleting ? "Excluindo..." : "Excluir"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipTrigger>
                          <TooltipContent>Excluir treino</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Dumbbell className="h-8 w-8 text-muted-foreground/50" />
                        <div className="text-lg font-medium">Nenhum treino encontrado</div>
                        <div className="text-sm">Tente ajustar os filtros ou criar um novo treino</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-muted-foreground/10">
            <div className="text-sm text-muted-foreground">
              Mostrando {filtered.length} de {items.length} treinos
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1 || loading}
                className="bg-background/80 hover:bg-muted/80"
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Página</span>
                <span className="text-sm font-semibold text-foreground px-2 py-1 bg-primary/10 rounded">{page}</span>
                <span className="text-sm text-muted-foreground">de {totalPages || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={totalPages > 0 ? page >= totalPages || loading : loading}
                className="bg-background/80 hover:bg-muted/80"
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
