"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { clientService } from "@/services/client-service"
import { workoutService } from "@/services/workout-service"

type Props = { clientId: number }

export default function WorkoutSection({ clientId }: Props) {
  const [loading, setLoading] = React.useState(true)
  const [current, setCurrent] = React.useState<any>(null)
  const [history, setHistory] = React.useState<any[]>([])
  const [exercises, setExercises] = React.useState<any[]>([])
  const [progress, setProgress] = React.useState<any[]>([])

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const [cur, hist] = await Promise.all([
          clientService.getWorkoutCurrent(clientId),
          clientService.getWorkoutHistory(clientId),
        ])
        setCurrent(cur)
        setHistory(hist || [])
      } finally {
        setLoading(false)
      }
    }
    if (clientId) run()
  }, [clientId])

// Quando o treino atual carregar, busca exercícios e progresso
React.useEffect(() => {
  const fetchMore = async () => {
    const id = current?.id ?? current?.workoutId ?? current?.WorkoutId
    if (!id) {
      setExercises([])
      setProgress([])
      return
    }
    try {
      const [full, prog] = await Promise.all([
        workoutService.getById(Number(id)),
        workoutService.getProgress(Number(id)),
      ])
      const items = (full?.exercises ?? full?.workoutExercises ?? [])
      setExercises(Array.isArray(items) ? items : [])
      setProgress(Array.isArray(prog) ? prog : [])
    } catch (e) {
      setExercises([])
      setProgress([])
    }
  }
  fetchMore()
}, [current?.id])

  if (loading) {
    return <Skeleton className="h-48 w-full" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Treino atual</CardTitle></CardHeader>
        <CardContent>
          {!current ? (
            <div className="text-sm text-muted-foreground">Sem treino atual.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><b>Nome:</b> {current?.name ?? "-"}</div>
              <div><b>Início:</b> {current?.startDate ? new Date(current.startDate).toLocaleDateString() : "-"}</div>
              <div><b>Duração:</b> {current?.duration ?? "-"} dias</div>
              <div><b>Foco:</b> {current?.focus ?? "-"}</div>
            </div>
          )}
        <Card>
  <CardHeader><CardTitle>Exercícios do treino atual</CardTitle></CardHeader>
  <CardContent>
    {(!current || exercises.length === 0) ? (
      <div className="text-sm text-muted-foreground">Nenhum exercício para o treino atual.</div>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Exercício</TableHead>
              <TableHead>Séries</TableHead>
              <TableHead>Reps</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead>Descanso</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.sort((a,b) => (a.order ?? 0) - (b.order ?? 0)).map((ex, idx) => (
              <TableRow key={ex.id ?? idx}>
                <TableCell>{typeof ex.order === "number" ? ex.order : idx + 1}</TableCell>
                <TableCell>{ex.exerciseName ?? ex.name ?? (ex.exercise && ex.exercise.name) ?? "-"}</TableCell>
                <TableCell>{ex.sets ?? "-"}</TableCell>
                <TableCell>{ex.reps ?? "-"}</TableCell>
                <TableCell>{ex.weight ?? "-"}</TableCell>
                <TableCell>{ex.restTime ? `${ex.restTime}s` : "-"}</TableCell>
                <TableCell className="max-w-[240px] whitespace-normal break-words">{ex.notes ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </CardContent>
</Card>

</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Histórico de treinos</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem histórico.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plano</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Foco</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((it, idx) => (
                    <TableRow key={`work-h-${idx}`}>
                      <TableCell>{it?.name ?? "-"}</TableCell>
                      <TableCell>{it?.startDate ? new Date(it.startDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{it?.duration ?? "-"}</TableCell>
                      <TableCell>{it?.focus ?? "-"}</TableCell>
                      <TableCell>{String(it?.status ?? "-")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      <Card>
  <CardHeader><CardTitle>Progresso do treino</CardTitle></CardHeader>
  <CardContent>
    {(!current || progress.length === 0) ? (
      <div className="text-sm text-muted-foreground">Sem progresso registrado ainda.</div>
    ) : (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progress.map(p => ({ 
            date: new Date(p.date).toLocaleDateString(), 
            rating: p.rating ?? null, 
            energy: p.energyLevel ?? null 
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rating" name="Avaliação" />
            <Line type="monotone" dataKey="energy" name="Energia" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </CardContent>
</Card>
</Card>
    </div>
  )
}
