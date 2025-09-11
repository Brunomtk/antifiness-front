"use client"

import * as React from "react"
import Link from "next/link"
import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { clientService } from "@/services/client-service"
import type { Client } from "@/types/client"
import { Eye, Pencil, Trash, RefreshCcw, Plus, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export type ClientTableProps = {
  items: Client[]
  hideCreateButton?: boolean
  loading?: boolean
  onRefresh?: () => void
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (q: string) => void
  onOpenFilters?: () => void
}

export default function ClientTable({
  items,
  loading,
  onRefresh,
  page,
  pageCount,
  onPageChange,
  search,
  onSearchChange,
  onOpenFilters,
  hideCreateButton = false,
}: ClientTableProps) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((c) => c.name.toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q))
  }, [items, search])

  const { toast } = useToast()
  const [deleteTarget, setDeleteTarget] = React.useState<Client | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await clientService.remove(deleteTarget.id)
      toast({ title: "Cliente excluído", description: `#${deleteTarget.id} removido.` })
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
    <TooltipProvider>
      <Card className="border-none shadow-lg bg-gradient-to-b from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-background to-muted/30 rounded-t-lg">
          <CardTitle className="text-xl font-semibold text-foreground">Clientes</CardTitle>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
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
            {!hideCreateButton && (
              <Button asChild className="bg-primary hover:bg-primary/90 shadow-md">
                <Link href="/admin/clients/create">
                  <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-lg border-x border-b border-muted-foreground/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/60 border-b border-muted-foreground/10">
                  <TableHead className="font-semibold text-foreground">Cliente</TableHead>
                  <TableHead className="font-semibold text-foreground">Telefone</TableHead>
                  <TableHead className="font-semibold text-foreground">Atividade</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Criado</TableHead>
                  <TableHead className="text-right pr-6 font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow
                    key={`client-row-${c.id}`}
                    className="hover:bg-muted/30 transition-colors border-b border-muted-foreground/5"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-muted-foreground/10">
                          <AvatarImage src={c.avatar || ""} alt={c.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {(c.name || "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{c.name}</span>
                          <span className="text-sm text-muted-foreground">{c.email || "-"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted/60 text-foreground font-medium">
                        {(() => {
                          const map: any = { 0: "Sedentária", 1: "Leve", 2: "Moderada", 3: "Ativa", 4: "Muito ativa" }
                          const v = c.activityLevel
                          return map[v as keyof typeof map] ?? "-"
                        })()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const v = c.kanbanStage
                        const labelMap: any = { 0: "Lead", 1: "Prospect", 2: "Ativo", 3: "Inativo", 4: "Concluído" }
                        const colorMap: any = {
                          0: "bg-amber-500 text-white shadow-md",
                          1: "bg-blue-500 text-white shadow-md",
                          2: "bg-green-500 text-white shadow-md",
                          3: "bg-gray-500 text-white shadow-md",
                          4: "bg-violet-500 text-white shadow-md",
                        }
                        const label = labelMap[v as keyof typeof labelMap] ?? "-"
                        const cls = colorMap[v as keyof typeof colorMap] ?? "bg-muted text-foreground"
                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}
                          >
                            {label}
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.createdDate).toLocaleDateString()}
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
                              <Link href={`/admin/clients/${c.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver cliente</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="h-8 w-8 hover:bg-green-100 hover:text-green-600 transition-colors"
                            >
                              <Link href={`/admin/clients/${c.id}#edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar cliente</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteTarget(c)}
                                  className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-colors"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O cliente #{c.id} será removido permanentemente.
                                  </AlertDialogDescription>
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
                          <TooltipContent>Excluir cliente</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-medium">Nenhum cliente encontrado</div>
                        <div className="text-sm">Tente ajustar os filtros ou criar um novo cliente</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-muted-foreground/10">
            <div className="text-sm text-muted-foreground">
              Mostrando {filtered.length} de {items.length} clientes
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
                <span className="text-sm text-muted-foreground">de {pageCount || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={pageCount > 0 ? page >= pageCount || loading : loading}
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
