"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Workout, WorkoutExercise } from "@/types/workout"
import { workoutService } from "@/services/workout-service"
import ExercisesPicker from "./ExercisesPicker"
import { useClients } from "@/hooks/use-client"

type Props = { mode: "create" | "edit"; initial?: Workout | null; workoutId?: number }

export default function WorkoutForm({ mode, initial, workoutId }: Props) {
  const router = useRouter()
  const { clients, fetchClients } = useClients()

  const [name, setName] = React.useState(initial?.name || "")
  const [description, setDescription] = React.useState(initial?.description || "")
  const [type, setType] = React.useState<number | undefined>(initial?.type)
  const [difficulty, setDifficulty] = React.useState<number | undefined>(initial?.difficulty)
  const [estimatedDuration, setEstimatedDuration] = React.useState<number | undefined>(initial?.estimatedDuration)
  const [estimatedCalories, setEstimatedCalories] = React.useState<number | undefined>(initial?.estimatedCalories)
  const [tags, setTags] = React.useState<string>((initial?.tags || []).join(", "))
  const [isTemplate, setIsTemplate] = React.useState<boolean>(!!initial?.isTemplate)
  const [notes, setNotes] = React.useState(initial?.notes || "")
  const [empresaId, setEmpresaId] = React.useState<number | undefined>(initial?.empresaId)
  const [empresaName, setEmpresaName] = React.useState<string>("")
  const [clientId, setClientId] = React.useState<number | undefined>(initial?.clientId || undefined)
  const [clientName, setClientName] = React.useState<string>("")

  const [exercises, setExercises] = React.useState<WorkoutExercise[]>(
    (initial?.exercises || []).map((e, idx) => ({
      id: e.id,
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      order: e.order ?? (idx + 1),
      sets: e.sets ?? 3,
      reps: e.reps ?? 10,
      weight: e.weight ?? 0,
      restTime: e.restTime ?? 60,
      notes: e.notes || "",
    }))
  )

  React.useEffect(() => { if (clients.length === 0) fetchClients() }, [])
  // Auto preencher Empresa (ID) do usuário logado e buscar nome da empresa
  React.useEffect(() => {
    const loadEmpresa = async () => {
      try {
        let empId = empresaId
        if (!empId) {
          const token = localStorage.getItem("token")
          if (!token) return
          const payload = JSON.parse(atob(token.split(".")[1]))
          const userId = payload?.sub
          if (!userId) return
          const { data: user } = await api.get(`/Users/${userId}`)
          empId = user?.empresaId
          if (empId) setEmpresaId(empId)
        }
        if (empId) {
          const { data: empresa } = await api.get(`/Empresas/${empId}`)
          if (empresa?.name) setEmpresaName(empresa.name)
        }
      } catch (err) {
        console.error("Falha ao carregar empresa:", err)
      }
    }
    if (mode === "create" || empresaId) {
      loadEmpresa()
    }
  }, [mode, empresaId])

  React.useEffect(() => {
    const c = clients.find((c) => c.id === clientId)
    setClientName(c?.name || "")
  }, [clientId, clients])

  const [pickerOpen, setPickerOpen] = React.useState(false)

  const addExercise = (ex: { id: number; name: string }) => {
    const nextOrder = (exercises[exercises.length - 1]?.order || exercises.length) + 1
    setExercises((arr) => [...arr, { exerciseId: ex.id, exerciseName: ex.name, order: nextOrder, sets: 3, reps: 10, weight: 0, restTime: 60, notes: "" }])
  }

  const move = (index: number, dir: -1 | 1) => {
    setExercises((arr) => {
      const copy = [...arr]
      const newIndex = index + dir
      if (newIndex < 0 || newIndex >= copy.length) return copy
      const [item] = copy.splice(index, 1)
      copy.splice(newIndex, 0, item)
      return copy.map((e, i) => ({ ...e, order: i + 1 }))
    })
  }

  const remove = (index: number) => {
    setExercises((arr) => arr.filter((_, i) => i !== index).map((e, i) => ({ ...e, order: i + 1 })))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) { toast({ title: "Informe o nome do treino" }); return }
    try {
      const payload = {
        name,
        description,
        type,
        difficulty,
        estimatedDuration,
        estimatedCalories,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        isTemplate,
        notes,
        empresaId,
        clientId: isTemplate ? undefined : clientId, // modelos não devem ter clientId
        exercises: exercises.map((e, i) => ({
          exerciseId: e.exerciseId,
          order: i + 1,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight ?? 0,
          restTime: e.restTime ?? 60,
          notes: e.notes || "",
        })),
      }
      if (mode === "create") {
        const created = await workoutService.create(payload as any)
        toast({ title: "Treino criado", description: `#${created.id} • ${created.name}` })
        router.push(`/admin/workouts/${created.id}`)
      } else if (mode === "edit" && workoutId) {
        const updated = await workoutService.update(workoutId, payload as any)
        toast({ title: "Treino atualizado", description: `#${updated.id}` })
      }
    } catch (err: any) {
      toast({ title: "Falha ao salvar", description: String(err?.response?.data || err?.message || err) })
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="flex items-center justify-between flex-row">
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
        <CardTitle className="text-xl">{mode === "create" ? "Novo Treino" : initial ? `Editar Treino #${initial.id}` : "Editar Treino"}</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do treino" />
          </div>
          <div className="space-y-2">
            <Label>Empresa (ID)</Label>
            <Input type="number" value={empresaId ?? ""} readOnly />
            {empresaName ? <div className="text-xs text-muted-foreground">Empresa: {empresaName}</div> : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type ? String(type) : ""} onValueChange={(v) => setType(Number(v))}>
  <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Força</SelectItem>
    <SelectItem value="2">Hipertrofia</SelectItem>
    <SelectItem value="3">HIIT</SelectItem>
    <SelectItem value="4">Cardio</SelectItem>
    <SelectItem value="5">Mobilidade</SelectItem>
  </SelectContent>
</Select>
          </div>
          <div className="space-y-2">
            <Label>Dificuldade</Label>
            <Select value={difficulty ? String(difficulty) : ""} onValueChange={(v) => setDifficulty(Number(v))}>
  <SelectTrigger><SelectValue placeholder="Selecione a dificuldade" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Iniciante</SelectItem>
    <SelectItem value="2">Intermediário</SelectItem>
    <SelectItem value="3">Avançado</SelectItem>
  </SelectContent>
</Select>
          </div>

          <div className="space-y-2">
            <Label>Duração estimada (min)</Label>
            <Input type="number" value={estimatedDuration ?? ""} onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="space-y-2">
            <Label>Calorias estimadas</Label>
            <Input type="number" value={estimatedCalories ?? ""} onChange={(e) => setEstimatedCalories(e.target.value ? Number(e.target.value) : undefined)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Tags (separe por vírgula)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>É modelo?</Label>
            <div className="flex items-center gap-2">
              <Checkbox checked={isTemplate} onCheckedChange={(v) => setIsTemplate(!!v)} />
              <span className="text-sm text-muted-foreground">Se marcado, não associa a um cliente</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select onValueChange={(v) => setClientId(Number(v))} defaultValue={clientId ? String(clientId) : undefined} disabled={isTemplate}>
              <SelectTrigger><SelectValue placeholder={isTemplate ? "Modelo não precisa de cliente" : clientName || "Selecione um cliente"} /></SelectTrigger>
              <SelectContent className="max-h-80">
                {clients.map((c) => (<SelectItem key={`c-${c.id}`} value={String(c.id)}>{c.name} <span className="text-muted-foreground">#{c.id}</span></SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {/* Exercises Builder */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base">Exercícios</Label>
              <Button type="button" onClick={() => setPickerOpen(true)}><Search className="mr-2 h-4 w-4" />Adicionar exercício</Button>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Exercício</TableHead>
                    <TableHead>Sets</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead>Kg</TableHead>
                    <TableHead>Descanso (s)</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercises.map((e, idx) => (
                    <TableRow key={`wx-${idx}`}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{e.exerciseName || `#${e.exerciseId}`}</TableCell>
                      <TableCell><Input type="number" value={e.sets} onChange={(ev) => {
                        const v = Number(ev.target.value || 0); setExercises((arr) => arr.map((it, i) => i===idx ? { ...it, sets: v } : it))
                      }} className="w-20" /></TableCell>
                      <TableCell><Input type="number" value={e.reps} onChange={(ev) => {
                        const v = Number(ev.target.value || 0); setExercises((arr) => arr.map((it, i) => i===idx ? { ...it, reps: v } : it))
                      }} className="w-20" /></TableCell>
                      <TableCell><Input type="number" value={e.weight ?? 0} onChange={(ev) => {
                        const v = Number(ev.target.value || 0); setExercises((arr) => arr.map((it, i) => i===idx ? { ...it, weight: v } : it))
                      }} className="w-24" /></TableCell>
                      <TableCell><Input type="number" value={e.restTime ?? 60} onChange={(ev) => {
                        const v = Number(ev.target.value || 0); setExercises((arr) => arr.map((it, i) => i===idx ? { ...it, restTime: v } : it))
                      }} className="w-28" /></TableCell>
                      <TableCell className="max-w-[240px]"><Input value={e.notes || ""} onChange={(ev) => {
                        const v = ev.target.value; setExercises((arr) => arr.map((it, i) => i===idx ? { ...it, notes: v } : it))
                      }} /></TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => move(idx, -1)}><ArrowUp className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => move(idx, 1)}><ArrowDown className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(idx)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {exercises.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Nenhum exercício adicionado.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2">
          <Button type="submit"><Save className="mr-2 h-4 w-4" />Salvar</Button>
        </CardFooter>
      </form>

      {/* Picker */}
      <ExercisesPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={addExercise} />
    </Card>
  )
}
