"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, RefreshCcw, Filter, Pencil, Trash, MoreHorizontal } from "lucide-react"
import type { Exercise } from "@/types/exercise"

export default function ExerciseTable({
  items, loading, onRefresh, page, totalPages, onPageChange, search, onSearchChange, onOpenFilters, onEdit, onDelete
}: {
  items: Exercise[]
  loading?: boolean
  onRefresh?: () => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  search: string
  onSearchChange: (q: string) => void
  onOpenFilters?: () => void
  onEdit: (ex: Exercise | null) => void
  onDelete: (ex: Exercise) => void
}) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="flex items-center justify-between flex-row">
        <CardTitle className="text-xl">Exercícios</CardTitle>
        <div className="flex items-center gap-2">
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Buscar por nome..." className="w-[240px]" />
          <Button variant="outline" onClick={() => onOpenFilters?.()}><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" /> Atualizar</Button>
          <Button onClick={() => onEdit(null)}><Plus className="mr-2 h-4 w-4" /> Novo</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((ex) => (
                <TableRow key={`ex-${ex.id}`}>
                  <TableCell className="font-medium">{ex.name}</TableCell>
                  <TableCell>{ex.difficulty ?? "-"}</TableCell>
                  <TableCell>{ex.category ?? "-"}</TableCell>
                  <TableCell>{ex.isActive ? "Sim" : "Não"}</TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onEdit(ex) }} className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onDelete(ex) }} className="flex items-center gap-2 text-destructive"><Trash className="h-4 w-4" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sem exercícios.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1 || loading}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Página <b>{page}</b> de <b>{totalPages || 1}</b></span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={totalPages > 0 ? page >= totalPages || loading : loading}>Próxima</Button>
        </div>
      </CardContent>
    </Card>
  )
}
