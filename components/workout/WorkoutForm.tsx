"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Dumbbell,
  User,
  Building2,
  Target,
  Clock,
  Flame,
  Tag,
  FileText,
  Users,
  Play,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Workout, WorkoutExercise } from "@/types/workout"
import { workoutService } from "@/services/workout-service"
import ExercisesPicker from "./ExercisesPicker"
import { useClients } from "@/hooks/use-client"
import { exerciseService } from "@/services/exercise-service"
import { ExerciseVideoModal } from "./ExerciseVideoModal"

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
      order: e.order ?? idx + 1,
      sets: e.sets ?? 3,
      reps: e.reps ?? 10,
      weight: e.weight ?? 0,
      restTime: e.restTime ?? 60,
      notes: e.notes || "",
    })),
  )

  React.useEffect(() => {
    if (clients.length === 0) fetchClients()
  }, [])

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
  const [isVideoOpen, setIsVideoOpen] = React.useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = React.useState<number | null>(null)

  React.useEffect(() => {
    const fetchExerciseNames = async () => {
      const exercisesWithoutNames = exercises.filter((e) => !e.exerciseName && e.exerciseId)

      if (exercisesWithoutNames.length === 0) return

      try {
        const promises = exercisesWithoutNames.map((e) => exerciseService.getById(e.exerciseId).catch(() => null))
        const results = await Promise.all(promises)

        setExercises((prev) =>
          prev.map((e) => {
            if (e.exerciseName) return e
            const exerciseData = results.find((r) => r?.id === e.exerciseId)
            return exerciseData ? { ...e, exerciseName: exerciseData.name } : e
          }),
        )
      } catch (err) {
        console.error("Failed to fetch exercise names:", err)
      }
    }

    fetchExerciseNames()
  }, [exercises.length])

  const addExercise = (ex: { id: number; name: string }) => {
    const nextOrder = (exercises[exercises.length - 1]?.order || exercises.length) + 1
    setExercises((arr) => [
      ...arr,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        order: nextOrder,
        sets: 3,
        reps: 10,
        weight: 0,
        restTime: 60,
        notes: "",
      },
    ])
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

  const handlePlayVideo = (exerciseId: number) => {
    setSelectedExerciseId(exerciseId)
    setIsVideoOpen(true)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast({ title: "Informe o nome do treino" })
      return
    }
    try {
      const payload = {
        name,
        description,
        type,
        difficulty,
        estimatedDuration,
        estimatedCalories,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
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
        const updated = await workoutService.updateSafe(workoutId, payload as any)
        toast({ title: "Treino atualizado", description: `#${updated.id}` })
      }
    } catch (err: any) {
      toast({ title: "Falha ao salvar", description: String(err?.response?.data || err?.message || err) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4">
              <Dumbbell className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {mode === "create" ? "Novo Treino" : initial ? `Editar Treino #${initial.id}` : "Editar Treino"}
              </h1>
              <p className="text-orange-100">
                {mode === "create" ? "Crie um novo treino personalizado" : "Edite as informações do treino"}
              </p>
            </div>
          </div>
          <Button onClick={() => router.back()} variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell className="h-5 w-5 text-blue-600" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Nome
                </Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do treino" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Empresa (ID)
                </Label>
                <Input type="number" value={empresaId ?? ""} readOnly />
                {empresaName ? <div className="text-xs text-muted-foreground">Empresa: {empresaName}</div> : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Descrição
                </Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-green-600" />
                Configuração do Treino
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type ? String(type) : ""} onValueChange={(v) => setType(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Iniciante</SelectItem>
                    <SelectItem value="2">Intermediário</SelectItem>
                    <SelectItem value="3">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  Duração estimada (min)
                </Label>
                <Input
                  type="number"
                  value={estimatedDuration ?? ""}
                  onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-green-600" />
                  Calorias estimadas
                </Label>
                <Input
                  type="number"
                  value={estimatedCalories ?? ""}
                  onChange={(e) => setEstimatedCalories(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-purple-600" />
                Cliente e Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-600" />
                  Tags (separe por vírgula)
                </Label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>É modelo?</Label>
                <div className="flex items-center gap-2">
                  <Checkbox checked={isTemplate} onCheckedChange={(v) => setIsTemplate(!!v)} />
                  <span className="text-sm text-muted-foreground">Se marcado, não associa a um cliente</span>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />
                  Cliente
                </Label>
                <Select
                  onValueChange={(v) => setClientId(Number(v))}
                  defaultValue={clientId ? String(clientId) : undefined}
                  disabled={isTemplate}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isTemplate ? "Modelo não precisa de cliente" : clientName || "Selecione um cliente"}
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {clients.map((c) => (
                      <SelectItem key={`c-${c.id}`} value={String(c.id)}>
                        {c.name} <span className="text-muted-foreground">#{c.id}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Notas
                </Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-orange-600" />
                  Exercícios ({exercises.length})
                </div>
                <Button type="button" onClick={() => setPickerOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Exercício
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Exercício</TableHead>
                      <TableHead className="font-semibold">Sets</TableHead>
                      <TableHead className="font-semibold">Reps</TableHead>
                      <TableHead className="font-semibold">Kg</TableHead>
                      <TableHead className="font-semibold">Descanso (s)</TableHead>
                      <TableHead className="font-semibold">Notas</TableHead>
                      <TableHead className="text-right pr-6 font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercises.map((e, idx) => (
                      <TableRow key={`wx-${idx}`} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell className="font-medium text-orange-700">
                          <div className="flex items-center gap-2">
                            <span>{e.exerciseName || `Exercício #${e.exerciseId}`}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                              onClick={() => handlePlayVideo(e.exerciseId)}
                              title="Ver vídeo do exercício"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={e.sets}
                            onChange={(ev) => {
                              const v = Number(ev.target.value || 0)
                              setExercises((arr) => arr.map((it, i) => (i === idx ? { ...it, sets: v } : it)))
                            }}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={e.reps}
                            onChange={(ev) => {
                              const v = Number(ev.target.value || 0)
                              setExercises((arr) => arr.map((it, i) => (i === idx ? { ...it, reps: v } : it)))
                            }}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={e.weight ?? 0}
                            onChange={(ev) => {
                              const v = Number(ev.target.value || 0)
                              setExercises((arr) => arr.map((it, i) => (i === idx ? { ...it, weight: v } : it)))
                            }}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={e.restTime ?? 60}
                            onChange={(ev) => {
                              const v = Number(ev.target.value || 0)
                              setExercises((arr) => arr.map((it, i) => (i === idx ? { ...it, restTime: v } : it)))
                            }}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell className="max-w-[240px]">
                          <Input
                            value={e.notes || ""}
                            onChange={(ev) => {
                              const v = ev.target.value
                              setExercises((arr) => arr.map((it, i) => (i === idx ? { ...it, notes: v } : it)))
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => move(idx, -1)} disabled={idx === 0}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => move(idx, 1)}
                              disabled={idx === exercises.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(idx)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {exercises.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Dumbbell className="h-8 w-8 text-gray-400" />
                            <p>Nenhum exercício adicionado.</p>
                            <p className="text-sm">Clique em "Adicionar Exercício" para começar.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="bg-orange-600 hover:bg-orange-700">
            <Save className="mr-2 h-4 w-4" />
            Salvar Treino
          </Button>
        </div>
      </form>

      <ExercisesPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={addExercise} />

      <ExerciseVideoModal isOpen={isVideoOpen} onOpenChange={setIsVideoOpen} exerciseId={selectedExerciseId} />
    </div>
  )
}
