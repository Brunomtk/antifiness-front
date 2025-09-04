"use client"

import Link from "next/link"
import * as React from "react"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { planStatusLabel, planTypeLabel, type Plan } from "@/types/plan"
import { Plus, RefreshCcw, Eye, Pencil, Trash, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export type PlanTableProps = {
  items: Plan[]
  loading?: boolean
  onRefresh?: () => void
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  onSearchChange: (q: string) => void
  search: string
}


export default function PlanTable({ items, loading, onRefresh, page, pageCount, onPageChange, search, onSearchChange }: PlanTableProps) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) => p.name.toLowerCase().includes(q))
  }, [items, search])

  const { toast } = useToast()
  const [deleteTarget, setDeleteTarget] = React.useState<Plan | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await (await import("@/services/plan-service")).planService.remove(deleteTarget.id)
      toast({ title: "Plano excluído", description: `#${deleteTarget.id} removido.` })
      setDeleteTarget(null)
      onRefresh?.()
    } catch (error: any) {
      const message = error?.response?.data || error?.message || "Erro ao excluir"
      toast({ title: "Falha", description: String(message) })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Planos</CardTitle>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="w-[220px]" />
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
          <Button asChild>
            <Link href="/admin/plans/create">
              <Plus className="mr-2 h-4 w-4" /> Novo Plano
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Calorias alvo</TableHead>
                <TableHead>Peso alvo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((plan) => (
                <TableRow key={`plan-row-${plan.id}`}>
                  <TableCell className="font-mono">#{plan.id}</TableCell>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{planTypeLabel(plan.type)}</Badge>
                  </TableCell>
                  <TableCell>{plan.duration}d</TableCell>
                  <TableCell>{plan.targetCalories ?? "-"}</TableCell>
                  <TableCell>{plan.targetWeight ?? "-"}</TableCell>
                  <TableCell>
                    <Badge>{planStatusLabel(plan.status)}</Badge>
                  </TableCell>
                  <TableCell>{new Date(plan.startDate).toLocaleDateString()}</TableCell>
                  
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Ações">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/plans/${plan.id}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Ver
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/plans/${plan.id}`} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => { e.preventDefault(); setDeleteTarget(plan); }}
                              className="text-destructive focus:text-destructive flex items-center gap-2"
                            >
                              <Trash className="h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O plano #{'${'}plan.id{'}'} será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
                                {deleting ? "Excluindo..." : "Excluir"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
    
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Nenhum plano encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Paginação */}
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1 || loading}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página <b>{page}</b> de <b>{pageCount || 1}</b>
          </span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={pageCount > 0 ? page >= pageCount || loading : loading}>
            Próxima
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
