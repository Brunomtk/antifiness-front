"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { workoutService } from "@/services/workout-service"
import type { Workout, WorkoutProgress } from "@/types/workout"
import { useClients } from "@/hooks/use-client"

export default function WorkoutProgress({ workout }: { workout: Workout }) {
  const [items, setItems] = React.useState<WorkoutProgress[]>([])
  const [loading, setLoading] = React.useState(true)
  const { clients, fetchClients } = useClients()

  const fetch = async () => {
    try {
      setLoading(true)
      const data = await workoutService.getProgress(workout.id)
      setItems(data || [])
    } catch (err: any) {
      toast({ title: "Erro ao carregar progresso", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setLoading(false)
    }
  }
  React.useEffect(() => { fetch(); if (clients.length === 0) fetchClients() }, [workout.id])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const clientId = Number((form.elements.namedItem("clientId") as HTMLInputElement).value || 0) || undefined
    const date = (form.elements.namedItem("date") as HTMLInputElement).value
    const actualDuration = parseFloat((form.elements.namedItem("actualDuration") as HTMLInputElement).value || "0") || undefined
    const actualCalories = parseFloat((form.elements.namedItem("actualCalories") as HTMLInputElement).value || "0") || undefined
    const rating = parseFloat((form.elements.namedItem("rating") as HTMLInputElement).value || "0") || undefined
    const mood = parseFloat((form.elements.namedItem("mood") as HTMLInputElement).value || "0") || undefined
    const energyLevel = parseFloat((form.elements.namedItem("energyLevel") as HTMLInputElement).value || "0") || undefined
    const isCompleted = (form.elements.namedItem("isCompleted") as HTMLInputElement).checked
    const notes = (form.elements.namedItem("notes") as HTMLTextAreaElement).value || undefined

    if (!date) { toast({ title: "Informe a data" }); return }
    try {
      const payload: any = {
        clientId,
        date: new Date(date).toISOString(),
        actualDuration, actualCalories, rating, mood, energyLevel, isCompleted, notes,
        exerciseProgress: (workout.exercises || []).map((ex) => ({
          exerciseId: ex.exerciseId,
          completedSets: undefined,
          completedReps: undefined,
          weight: ex.weight ?? 0,
          isCompleted: isCompleted,
        }))
      }
      await workoutService.addProgress(workout.id, payload)
      toast({ title: "Progresso registrado" })
      form.reset()
      fetch()
    } catch (err: any) {
      toast({ title: "Erro ao registrar", description: String(err?.response?.data || err?.message || err) })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Novo registro</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2 md:col-span-2">
              <Label>Data</Label>
              <Input type="date" name="date" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Cliente (opcional)</Label>
              <select className="w-full border rounded-md h-10 px-3" name="clientId" defaultValue={workout.clientId || ""}>
                <option value="">—</option>
                {clients.map((c) => (<option key={`c-${c.id}`} value={c.id}>{c.name} #{c.id}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Duração real (min)</Label>
              <Input type="number" step="1" name="actualDuration" />
            </div>
            <div className="space-y-2">
              <Label>Calorias reais</Label>
              <Input type="number" step="1" name="actualCalories" />
            </div>
            <div className="space-y-2">
              <Label>Avaliação (0-10)</Label>
              <Input type="number" min="0" max="10" step="1" name="rating" />
            </div>
            <div className="space-y-2">
              <Label>Humor (1-5)</Label>
              <Input type="number" min="1" max="5" step="1" name="mood" />
            </div>
            <div className="space-y-2">
              <Label>Energia (0-10)</Label>
              <Input type="number" min="0" max="10" step="1" name="energyLevel" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notas</Label>
              <Textarea rows={2} name="notes" />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Checkbox name="isCompleted" id="chkCompleted" />
              <Label htmlFor="chkCompleted">Treino concluído</Label>
            </div>
            <div className="md:col-span-2 flex items-center justify-end">
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Aval.</TableHead>
                  <TableHead>Concluído</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={`prog-${it.id}`}>
                    <TableCell>{new Date(it.date).toLocaleDateString()}</TableCell>
                    <TableCell>{it.clientId ?? "-"}</TableCell>
                    <TableCell>{it.rating ?? "-"}</TableCell>
                    <TableCell>{it.isCompleted ? "Sim" : "Não"}</TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sem registros.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
