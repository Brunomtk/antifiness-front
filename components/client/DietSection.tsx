"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { clientService } from "@/services/client-service"
import { dietService } from "@/services/diet-service"

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


  if (loading) {
    return <Skeleton className="h-48 w-full" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Dieta atual</CardTitle></CardHeader>
        <CardContent>
          {!current ? (
            <div className="text-sm text-muted-foreground">Sem dieta atual.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><b>Nome:</b> {current?.name ?? "-"}</div>
              <div><b>Início:</b> {dietDetails?.startDate ? new Date(dietDetails.startDate).toLocaleDateString() : (current?.createdDate ? new Date(current.createdDate).toLocaleDateString() : "-")}</div>
              <div><b>Fim:</b> {dietDetails?.endDate ? new Date(dietDetails.endDate).toLocaleDateString() : "-"}</div>
              <div><b>kcal/dia:</b> {dietDetails?.dailyCalories ?? current?.dailyCalories ?? "-"}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metas da Dieta */}
      <Card>
        <CardHeader>
          <CardTitle>Metas diárias</CardTitle>
          <CardDescription>Alvos diários</CardDescription>
        </CardHeader>
        <CardContent>
          {dietDetails ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><b>Calorias:</b> {dietDetails.dailyCalories ?? '-' } kcal</div>
              <div><b>Proteínas:</b> {dietDetails.dailyProtein ?? '-' } g</div>
              <div><b>Carboidratos:</b> {dietDetails.dailyCarbs ?? '-' } g</div>
              <div><b>Gorduras:</b> {dietDetails.dailyFat ?? '-' } g</div>
              <div><b>Fibra:</b> {dietDetails.dailyFiber ?? '-' } g</div>
              <div><b>Sódio:</b> {dietDetails.dailySodium ?? '-' } mg</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Sem metas definidas.</div>
          )}
        </CardContent>
      </Card>

      {/* Refeições do Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Refeições</CardTitle>
          <CardDescription>Lista de refeições do plano atual</CardDescription>
        </CardHeader>
        <CardContent>
          
          {meals && meals.length > 0 ? (
            <div className="space-y-4">
              {meals.map((m, idx) => (
                <div key={m.id ?? idx} className="rounded-md border p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {m.name ?? '-'}{" "}
                      <span className="text-xs text-muted-foreground">({m.typeDescription ?? ''})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{m.scheduledTime ?? ''}</div>
                  </div>

                  {m.instructions && <div className="text-sm mt-1">{m.instructions}</div>}

                  {/* Tabela detalhada de alimentos da refeição */}
                  <div className="mt-3 overflow-x-auto">
                    {m.foods && m.foods.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="text-xs text-muted-foreground">
                          <tr className="border-b">
                            <th className="py-2 text-left">Alimento</th>
                            <th className="py-2 text-right">Qtd</th>
                            <th className="py-2 text-left">Un.</th>
                            <th className="py-2 text-right">kcal</th>
                            <th className="py-2 text-right">P (g)</th>
                            <th className="py-2 text-right">C (g)</th>
                            <th className="py-2 text-right">G (g)</th>
                            <th className="py-2 text-right">Fibra (g)</th>
                            <th className="py-2 text-right">Na (mg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.foods.map((f: any) => (
                            <tr key={f.id} className="border-b last:border-0">
                              <td className="py-2">{f.foodName ?? `#${f.foodId}`}</td>
                              <td className="py-2 text-right">{f.quantity ?? '-'}</td>
                              <td className="py-2">{f.unit ?? '-'}</td>
                              <td className="py-2 text-right">{f.calories ?? '-'}</td>
                              <td className="py-2 text-right">{f.protein ?? '-'}</td>
                              <td className="py-2 text-right">{f.carbs ?? '-'}</td>
                              <td className="py-2 text-right">{f.fat ?? '-'}</td>
                              <td className="py-2 text-right">{f.fiber ?? '-'}</td>
                              <td className="py-2 text-right">{f.sodium ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                        {/* Totais da refeição, se vierem preenchidos */}
                        <tfoot>
                          <tr className="border-t font-medium">
                            <td className="py-2 text-right" colSpan={3}>Totais</td>
                            <td className="py-2 text-right">{m.totalCalories ?? '-'}</td>
                            <td className="py-2 text-right">{m.totalProtein ?? '-'}</td>
                            <td className="py-2 text-right">{m.totalCarbs ?? '-'}</td>
                            <td className="py-2 text-right">{m.totalFat ?? '-'}</td>
                            <td className="py-2 text-right">—</td>
                            <td className="py-2 text-right">—</td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="text-sm text-muted-foreground">Nenhum alimento cadastrado para esta refeição.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhuma refeição cadastrada.</div>
          )}
</CardContent>
      </Card>

      {/* Progresso recente */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso</CardTitle>
          <CardDescription>Últimos registros</CardDescription>
        </CardHeader>
        <CardContent>
          {progress && progress.length > 0 ? (
            <div className="space-y-2">
              {progress.slice(0,5).map((p, idx) => (
                <div key={p.id ?? idx} className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.date ? new Date(p.date).toLocaleDateString('pt-BR') : '-'}</span>
                    <span>{p.mealsCompleted}/{p.totalMeals} • {Math.round(p.completionPercentage ?? 0)}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div><b>Peso:</b> {p.weight ?? '-'} kg</div>
                    <div><b>Calorias:</b> {p.caloriesConsumed ?? '-'} kcal</div>
                    <div className="col-span-2"><b>Energia/Fome/Satisfação:</b> {p.energyLevel ?? '-'} • {p.hungerLevel ?? '-'} • {p.satisfactionLevel ?? '-'}</div>
                  </div>
                  {p.notes && <div className="text-xs mt-1 text-muted-foreground">Notas: {p.notes}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Sem registros de progresso.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Histórico de dietas</CardTitle></CardHeader>
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
                    <TableHead>Carb (g)</TableHead><TableHead>Gord (g)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((it, idx) => (
                    <TableRow key={`diet-h-${idx}`}>
                      <TableCell>{it?.name ?? "-"}</TableCell>
                      <TableCell>{it?.createdDate ? new Date(it.createdDate).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{it?.dailyProtein ?? "-"}</TableCell>
                      <TableCell>{it?.dailyCalories ?? "-"}</TableCell>
                      <TableCell>{it?.dailyCarbs ?? '-'}</TableCell><TableCell>{it?.dailyFat ?? '-'}</TableCell>
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
