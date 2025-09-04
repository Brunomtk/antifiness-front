"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type Filters = {
  type?: number[]
  difficulty?: number[]
  status?: number[]
  tags?: string[]
  search?: string
  dateStart?: string
  dateEnd?: string
  isTemplate?: boolean
  empresaId?: number
  clientId?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export default function WorkoutFiltersDialog({
  open, onOpenChange, value, onApply, onClear
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  value: Filters
  onApply: (v: Filters) => void
  onClear: () => void
}) {
  const [local, setLocal] = React.useState<Filters>(value)
  React.useEffect(() => setLocal(value), [value])

  const apply = () => onApply(local)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Filtros de Treinos</DialogTitle>
          <DialogDescription>Refine os resultados</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Busca</Label>
            <Input value={local.search || ""} onChange={(e) => setLocal((s) => ({ ...s, search: e.target.value }))} placeholder="Nome, tags..." />
          </div>

          <div className="space-y-2">
            <Label>Data inicial</Label>
            <Input type="date" value={(local.dateStart || "").slice(0,10)} onChange={(e) => setLocal((s) => ({ ...s, dateStart: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Data final</Label>
            <Input type="date" value={(local.dateEnd || "").slice(0,10)} onChange={(e) => setLocal((s) => ({ ...s, dateEnd: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>Tags (separe por vírgula)</Label>
            <Input value={(local.tags || []).join(", ")} onChange={(e) => setLocal((s) => ({ ...s, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} />
          </div>

          <div className="space-y-2">
            <Label>Somente modelos?</Label>
            <div className="flex items-center gap-2">
              <Checkbox checked={!!local.isTemplate} onCheckedChange={(v) => setLocal((s) => ({ ...s, isTemplate: !!v }))} />
              <span className="text-sm text-muted-foreground">Exibe apenas treinos modelo</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ordenação</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="SortBy (ex.: createdAt)" value={local.sortBy || ""} onChange={(e) => setLocal((s) => ({ ...s, sortBy: e.target.value }))} />
              <Input placeholder="SortOrder (asc/desc)" value={local.sortOrder || ""} onChange={(e) => setLocal((s) => ({ ...s, sortOrder: e.target.value as any }))} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={onClear}>Limpar</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={apply}>Aplicar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
