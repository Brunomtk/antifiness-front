"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { clientService } from "@/services/client-service"
import { dietService } from "@/services/diet-service"
import {
  Utensils,
  Target,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Scale,
  TrendingUp,
  Clock,
  CheckCircle2,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Apple,
} from "lucide-react"

type Props = { clientId: number }

export default function DietSection({ clientId }: Props) {
  const [loading, setLoading] = React.useState(true)
  const [current, setCurrent] = React.useState<any>(null)
  const [history, setHistory] = React.useState<any[]>([])
  const [dietDetails, setDietDetails] = React.useState<any | null>(null)
  const [meals, setMeals] = React.useState<any[]>([])
  const [progress, setProgress] = React.useState<any[]>([])

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const [cur, hist] = await Promise.all([
          clientService.getDietCurrent(clientId),
          clientService.getDietHistory(clientId),
        ])
        setCurrent(cur)
        setHistory(hist || [])
      } finally {
        setLoading(false)
      }
    }

    if (clientId) run()
  }, [clientId])

  // Quando carregarmos a dieta atual, buscamos os detalhes completos
  React.useEffect(() => {
    const fetchMore = async () => {
      if (!current?.id) return
      try {
        const [details, mealsRes, progressRes] = await Promise.all([
          dietService.getDietById(current.id),
          dietService.getDietMeals(current.id),
          dietService.getDietProgress(current.id),
        ])
        setDietDetails(details)
        setMeals(mealsRes ?? [])
        setProgress(progressRes ?? [])
      } catch (e) {
        console.warn("Falha ao buscar detalhes da dieta do cliente:", e)
      }
    }
    fetchMore()
  }, [current?.id])

  const getMealTypeConfig = (type: number) => {
    const configs = {
      0: {
        name: "Café da Manhã",
        color: "bg-amber-500",
        icon: Coffee,
        lightColor: "bg-amber-50 text-amber-700 border-amber-200",
      },
      1: {
        name: "Lanche da Manhã",
        color: "bg-orange-500",
        icon: Apple,
        lightColor: "bg-orange-50 text-orange-700 border-orange-200",
      },
      2: {
        name: "Almoço",
        color: "bg-green-500",
        icon: Sun,
        lightColor: "bg-green-50 text-green-700 border-green-200",
      },
      3: {
        name: "Lanche da Tarde",
        color: "bg-blue-500",
        icon: Sunset,
        lightColor: "bg-blue-50 text-blue-700 border-blue-200",
      },
      4: {
        name: "Jantar",
        color: "bg-purple-500",
        icon: Moon,
        lightColor: "bg-purple-50 text-purple-700 border-purple-200",
      },
      5: {
        name: "Ceia",
        color: "bg-indigo-500",
        icon: Moon,
        lightColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      },
    }
    return configs[type as keyof typeof configs] || configs[0]
  }

  if (loading) {
    return <Skeleton className="h-48 w-full" />
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Utensils className="h-5 w-5" />
            Dieta atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!current ? (
            <div className="text-sm text-muted-foreground">Sem dieta atual.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-900">Nome:</span>
                  <span className="text-blue-800">{current?.name ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Início:</span>
                  <span className="text-blue-800">
                    {dietDetails?.startDate
                      ? new Date(dietDetails.startDate).toLocaleDateString()
                      : current?.createdDate
                        ? new Date(current.createdDate).toLocaleDateString()
                        : "-"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Fim:</span>
                  <span className="text-blue-800">
                    {dietDetails?.endDate ? new Date(dietDetails.endDate).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">kcal/dia:</span>
                  <span className="text-blue-800 font-bold">
                    {dietDetails?.dailyCalories ?? current?.dailyCalories ?? "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Metas diárias
          </CardTitle>
          <CardDescription>Alvos nutricionais diários</CardDescription>
        </CardHeader>
        <CardContent>
          {dietDetails ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-red-600" />
                  <span className="font-semibold text-red-900">Calorias</span>
                </div>
                <p className="text-2xl font-bold text-red-800">
                  {dietDetails.dailyCalories ?? "-"} <span className="text-sm">kcal</span>
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Beef className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Proteínas</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {dietDetails.dailyProtein ?? "-"} <span className="text-sm">g</span>
                </p>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Wheat className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Carboidratos</span>
                </div>
                <p className="text-2xl font-bold text-yellow-800">
                  {dietDetails.dailyCarbs ?? "-"} <span className="text-sm">g</span>
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-900">Gorduras</span>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {dietDetails.dailyFat ?? "-"} <span className="text-sm">g</span>
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Wheat className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">Fibra</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {dietDetails.dailyFiber ?? "-"} <span className="text-sm">g</span>
                </p>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">Sódio</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {dietDetails.dailySodium ?? "-"} <span className="text-sm">mg</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Sem metas definidas.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-600" />
            Refeições
          </CardTitle>
          <CardDescription>Lista de refeições do plano atual</CardDescription>
        </CardHeader>
        <CardContent>
          {meals && meals.length > 0 ? (
            <div className="space-y-6">
              {meals.map((m, idx) => {
                const mealConfig = getMealTypeConfig(m.type ?? 0)
                const MealIcon = mealConfig.icon

                return (
                  <div key={m.id ?? idx} className={`rounded-xl border-2 p-6 ${mealConfig.lightColor} shadow-sm`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${mealConfig.color} text-white`}>
                          <MealIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{m.name ?? mealConfig.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {mealConfig.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Clock className="h-4 w-4" />
                          {m.scheduledTime ?? "Horário não definido"}
                        </div>
                      </div>
                    </div>

                    {m.instructions && (
                      <div className="mb-4 p-3 bg-white/50 rounded-lg">
                        <p className="text-sm font-medium">{m.instructions}</p>
                      </div>
                    )}

                    {/* Enhanced food table */}
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                      {m.foods && m.foods.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Alimento</th>
                                <th className="py-3 px-2 text-right font-semibold text-gray-700">Qtd</th>
                                <th className="py-3 px-2 text-left font-semibold text-gray-700">Un.</th>
                                <th className="py-3 px-2 text-right font-semibold text-red-700">kcal</th>
                                <th className="py-3 px-2 text-right font-semibold text-blue-700">P (g)</th>
                                <th className="py-3 px-2 text-right font-semibold text-yellow-700">C (g)</th>
                                <th className="py-3 px-2 text-right font-semibold text-green-700">G (g)</th>
                                <th className="py-3 px-2 text-right font-semibold text-purple-700">Fibra (g)</th>
                                <th className="py-3 px-2 text-right font-semibold text-gray-700">Na (mg)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.foods.map((f: any, foodIdx: number) => (
                                <tr key={f.id} className={foodIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="py-3 px-4 font-medium">{f.foodName ?? `#${f.foodId}`}</td>
                                  <td className="py-3 px-2 text-right font-semibold">{f.quantity ?? "-"}</td>
                                  <td className="py-3 px-2">{f.unit ?? "-"}</td>
                                  <td className="py-3 px-2 text-right font-semibold text-red-600">
                                    {f.calories ?? "-"}
                                  </td>
                                  <td className="py-3 px-2 text-right font-semibold text-blue-600">
                                    {f.protein ?? "-"}
                                  </td>
                                  <td className="py-3 px-2 text-right font-semibold text-yellow-600">
                                    {f.carbs ?? "-"}
                                  </td>
                                  <td className="py-3 px-2 text-right font-semibold text-green-600">{f.fat ?? "-"}</td>
                                  <td className="py-3 px-2 text-right font-semibold text-purple-600">
                                    {f.fiber ?? "-"}
                                  </td>
                                  <td className="py-3 px-2 text-right font-semibold text-gray-600">
                                    {f.sodium ?? "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-100">
                              <tr className="font-bold">
                                <td className="py-3 px-4 text-right" colSpan={3}>
                                  Totais
                                </td>
                                <td className="py-3 px-2 text-right text-red-700">{m.totalCalories ?? "-"}</td>
                                <td className="py-3 px-2 text-right text-blue-700">{m.totalProtein ?? "-"}</td>
                                <td className="py-3 px-2 text-right text-yellow-700">{m.totalCarbs ?? "-"}</td>
                                <td className="py-3 px-2 text-right text-green-700">{m.totalFat ?? "-"}</td>
                                <td className="py-3 px-2 text-right">—</td>
                                <td className="py-3 px-2 text-right">—</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">
                          Nenhum alimento cadastrado para esta refeição.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma refeição cadastrada.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Progresso
          </CardTitle>
          <CardDescription>Últimos registros de acompanhamento</CardDescription>
        </CardHeader>
        <CardContent>
          {progress && progress.length > 0 ? (
            <div className="space-y-4">
              {progress.slice(0, 5).map((p, idx) => (
                <div
                  key={p.id ?? idx}
                  className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">
                      {p.date ? new Date(p.date).toLocaleDateString("pt-BR") : "-"}
                    </span>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-700">
                        {p.mealsCompleted}/{p.totalMeals} refeições
                      </span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        {Math.round(p.completionPercentage ?? 0)}%
                      </Badge>
                    </div>
                  </div>

                  <Progress value={p.completionPercentage ?? 0} className="mb-3" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Peso:</span>
                      <span className="text-blue-700 font-bold">{p.weight ?? "-"} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-600" />
                      <span className="font-semibold">Calorias:</span>
                      <span className="text-red-700 font-bold">{p.caloriesConsumed ?? "-"} kcal</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="font-semibold text-orange-700">Energia</div>
                      <div className="text-lg font-bold text-orange-600">{p.energyLevel ?? "-"}/10</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="font-semibold text-red-700">Fome</div>
                      <div className="text-lg font-bold text-red-600">{p.hungerLevel ?? "-"}/10</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="font-semibold text-green-700">Satisfação</div>
                      <div className="text-lg font-bold text-green-600">{p.satisfactionLevel ?? "-"}/10</div>
                    </div>
                  </div>

                  {p.notes && (
                    <div className="mt-3 p-2 bg-white rounded border">
                      <span className="font-semibold text-gray-700">Notas:</span>
                      <p className="text-gray-600 mt-1">{p.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Sem registros de progresso.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de dietas</CardTitle>
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
                    <TableHead>Criada em</TableHead>
                    <TableHead>Prot (g)</TableHead>
                    <TableHead>kcal/dia</TableHead>
                    <TableHead>Carb (g)</TableHead>
                    <TableHead>Gord (g)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((it, idx) => (
                    <TableRow key={`diet-h-${idx}`}>
                      <TableCell>{it?.name ?? "-"}</TableCell>
                      <TableCell>{it?.createdDate ? new Date(it.createdDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{it?.dailyProtein ?? "-"}</TableCell>
                      <TableCell>{it?.dailyCalories ?? "-"}</TableCell>
                      <TableCell>{it?.dailyCarbs ?? "-"}</TableCell>
                      <TableCell>{it?.dailyFat ?? "-"}</TableCell>
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
