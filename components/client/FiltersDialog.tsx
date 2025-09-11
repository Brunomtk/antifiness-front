"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ClientsQuery } from "@/types/client"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  value: ClientsQuery
  onApply: (q: ClientsQuery) => void
  onClear: () => void
}

export default function FiltersDialog({ open, onOpenChange, value, onApply, onClear }: Props) {
  const [local, setLocal] = React.useState<ClientsQuery>(value)

  React.useEffect(() => setLocal(value), [value])

  const apply = () => onApply(local)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
          <DialogDescription>Refine a busca por clientes.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              onValueChange={(v) => setLocal((s) => ({ ...s, status: v === "all" ? undefined : v }))}
              defaultValue={local.status ? String(local.status) : "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                {[0, 1, 2, 3].map((s) => (
                  <SelectItem key={`st-${s}`} value={String(s)}>{`Status ${s}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Etapa (Kanban)</Label>
            <Select
              onValueChange={(v) => setLocal((s) => ({ ...s, kanbanStage: v === "all" ? undefined : v }))}
              defaultValue={local.kanbanStage ? String(local.kanbanStage) : "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                <SelectItem value="0">Lead</SelectItem>
                <SelectItem value="1">Prospect</SelectItem>
                <SelectItem value="2">Ativo</SelectItem>
                <SelectItem value="3">Inativo</SelectItem>
                <SelectItem value="4">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Atividade</Label>
            <Select
              onValueChange={(v) => setLocal((s) => ({ ...s, activityLevel: v === "all" ? undefined : v }))}
              defaultValue={local.activityLevel ? String(local.activityLevel) : "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                <SelectItem value="0">Sedentária</SelectItem>
                <SelectItem value="1">Leve</SelectItem>
                <SelectItem value="2">Moderada</SelectItem>
                <SelectItem value="3">Ativa</SelectItem>
                <SelectItem value="4">Muito ativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select
              onValueChange={(v) => setLocal((s) => ({ ...s, orderBy: v as any }))}
              defaultValue={String(local.orderBy ?? "name")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="createdDate">Criação</SelectItem>
                <SelectItem value="updatedDate">Atualização</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Direção</Label>
            <Select
              onValueChange={(v) => setLocal((s) => ({ ...s, orderDirection: v as any }))}
              defaultValue={String(local.orderDirection ?? "asc")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascendente</SelectItem>
                <SelectItem value="desc">Descendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Início</Label>
            <Input
              type="date"
              value={local.startDate || ""}
              onChange={(e) => setLocal((s) => ({ ...s, startDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Fim</Label>
            <Input
              type="date"
              value={local.endDate || ""}
              onChange={(e) => setLocal((s) => ({ ...s, endDate: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={onClear}>
            Limpar
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={apply}>Aplicar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
