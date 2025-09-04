"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { exerciseService } from "@/services/exercise-service"

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
      const res = await exerciseService.getPaged({ page, pageSize: 10, search })
      setItems(res.exercises || [])
      setTotalPages(res.totalPages || 1)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { if (open) fetch() }, [open, page, search])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>Escolher exercício</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="rounded-md border overflow-x-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right pr-6">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((ex) => (
                  <TableRow key={`ex-${ex.id}`}>
                    <TableCell className="font-medium">{ex.name}</TableCell>
                    <TableCell>{ex.difficulty ?? "-"}</TableCell>
                    <TableCell>{ex.category ?? "-"}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button size="sm" onClick={() => { onSelect({ id: ex.id, name: ex.name, difficulty: ex.difficulty, category: ex.category }); onOpenChange(false) }}>Adicionar</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sem exercícios.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page<=1 || loading}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página <b>{page}</b> de <b>{totalPages || 1}</b></span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p+1)} disabled={page>=totalPages || loading}>Próxima</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
