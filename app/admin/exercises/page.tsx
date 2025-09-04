"use client"

import * as React from "react"
import { exerciseService } from "@/services/exercise-service"
import ExerciseTable from "@/components/exercise/ExerciseTable"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { Exercise } from "@/types/exercise"

export default function ExercisesPage() {
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<Exercise[]>([])
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Exercise | null>(null)

  const [form, setForm] = React.useState<any>({
    name: "", description: "", instructions: "", muscleGroups: "", equipment: "", difficulty: 1, category: 1, tips: "", variations: "", mediaUrls: "", isActive: true, empresaId: undefined
  })

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await exerciseService.getPaged({ page, pageSize: 10, search })
      setItems(res.exercises || [])
      setTotalPages(res.totalPages || 1)
    } catch (err: any) {
      toast({ title: "Erro ao carregar exercícios", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setLoading(false)
    }
  }
  React.useEffect(() => { fetch() }, [page, search])

  const onEdit = (ex: Exercise | null) => {
    setEditing(ex)
    setForm(ex ? {
      ...ex,
      muscleGroups: (ex.muscleGroups || []).join(", "),
      equipment: (ex.equipment || []).join(", "),
      mediaUrls: (ex.mediaUrls || []).join(", "),
    } : { name: "", description: "", instructions: "", muscleGroups: "", equipment: "", difficulty: 1, category: 1, tips: "", variations: "", mediaUrls: "", isActive: true, empresaId: undefined })
    setOpen(true)
  }

  const onDelete = async (ex: Exercise) => {
    const ok = confirm(`Excluir exercício "${ex.name}"?`)
    if (!ok) return
    try {
      await exerciseService.remove(ex.id)
      toast({ title: "Exercício excluído" })
      fetch()
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: String(err?.response?.data || err?.message || err) })
    }
  }

  const save = async () => {
    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        instructions: form.instructions,
        muscleGroups: String(form.muscleGroups || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        equipment: String(form.equipment || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        difficulty: Number(form.difficulty || 0) || undefined,
        category: Number(form.category || 0) || undefined,
        tips: form.tips, variations: form.variations,
        mediaUrls: String(form.mediaUrls || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        isActive: !!form.isActive,
        empresaId: form.empresaId ? Number(form.empresaId) : undefined,
      }
      if (!editing) {
        await exerciseService.create(payload)
        toast({ title: "Exercício criado" })
      } else {
        await exerciseService.update(editing.id, payload)
        toast({ title: "Exercício atualizado" })
      }
      setOpen(false)
      fetch()
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: String(err?.response?.data || err?.message || err) })
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <ExerciseTable
        items={items}
        loading={loading}
        onRefresh={fetch}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Editar exercício" : "Novo exercício"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Empresa (ID)</Label>
              <Input type="number" value={form.empresaId ?? ""} onChange={(e) => setForm((s: any) => ({ ...s, empresaId: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Instruções</Label>
              <Textarea rows={2} value={form.instructions} onChange={(e) => setForm((s: any) => ({ ...s, instructions: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Músculos (vírgulas)</Label>
              <Input value={form.muscleGroups} onChange={(e) => setForm((s: any) => ({ ...s, muscleGroups: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Equipamentos (vírgulas)</Label>
              <Input value={form.equipment} onChange={(e) => setForm((s: any) => ({ ...s, equipment: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Input type="number" value={form.difficulty} onChange={(e) => setForm((s: any) => ({ ...s, difficulty: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input type="number" value={form.category} onChange={(e) => setForm((s: any) => ({ ...s, category: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Dicas</Label>
              <Textarea rows={2} value={form.tips} onChange={(e) => setForm((s: any) => ({ ...s, tips: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Variações</Label>
              <Textarea rows={2} value={form.variations} onChange={(e) => setForm((s: any) => ({ ...s, variations: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Media URLs (vírgulas)</Label>
              <Input value={form.mediaUrls} onChange={(e) => setForm((s: any) => ({ ...s, mediaUrls: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex items-center justify-end">
              <Button onClick={save}>{editing ? "Salvar alterações" : "Criar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
