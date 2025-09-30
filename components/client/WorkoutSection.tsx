"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { clientService } from "@/services/client-service"
import { workoutService } from "@/services/workout-service"
import {
  Dumbbell,
  Target,
  Clock,
  Zap,
  TrendingUp,
  Calendar,
  RotateCcw,
  Weight,
  Hash,
  Timer,
  StickyNote,
} from "lucide-react"

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
        const items = (full as any)?.exercises ?? (full as any)?.workoutExercises ?? []
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
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Dumbbell className="h-5 w-5" />
            Treino atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!current ? (
            <div className="text-sm text-muted-foreground">Sem treino atual.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-purple-900">Nome:</span>
                  <span className="text-purple-800">{current?.name ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">Início:</span>
                  <span className="text-purple-800">
                    {current?.startDate ? new Date(current.startDate).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">Duração:</span>
                  <span className="text-purple-800 font-bold">{current?.duration ?? "-"} dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">Foco:</span>
                  <span className="text-purple-800">{current?.focus ?? "-"}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Exercícios do treino atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!current || exercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum exercício para o treino atual.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((ex, idx) => (
                  <div
                    key={ex.id ?? idx}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-lg font-bold min-w-[40px] text-center">
                          {typeof ex.order === "number" ? ex.order : idx + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-blue-900">
                            {ex.exerciseName ?? ex.name ?? (ex.exercise && ex.exercise.name) ?? "-"}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-900">Séries</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{ex.sets ?? "-"}</p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <RotateCcw className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-900">Reps</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{ex.reps ?? "-"}</p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Weight className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-purple-900">Carga</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">
                          {ex.weight ?? "-"} <span className="text-sm">kg</span>
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold text-orange-900">Descanso</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{ex.restTime ? `${ex.restTime}s` : "-"}</p>
                      </div>
                    </div>

                    {ex.notes && (
                      <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <StickyNote className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">Observações</span>
                        </div>
                        <p className="text-gray-700">{ex.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Progresso do treino
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!current || progress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Sem progresso registrado ainda.</p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={progress.map((p) => ({
                      date: new Date(p.date).toLocaleDateString(),
                      rating: p.rating ?? null,
                      energy: p.energyLevel ?? null,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#6366f1" />
                    <YAxis domain={[0, 10]} stroke="#6366f1" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      name="Avaliação"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      name="Energia"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de treinos</CardTitle>
        </CardHeader>
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
      </Card>
    </div>
  )
}
