"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Utensils,
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  TrendingUp,
  Target,
  Droplets,
  Zap,
  RefreshCw,
  User,
  Clock,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMobile } from "@/hooks/use-mobile"
import { useClientDiet } from "@/hooks/use-client-diet"
import { getDietStatusLabel } from "@/types/diet"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

// Função para obter o label do tipo de refeição
const getMealTypeLabel = (type: number): string => {
  const types: { [key: number]: string } = {
    0: "Café da Manhã",
    1: "Lanche da Manhã",
    2: "Almoço",
    3: "Lanche da Tarde",
    4: "Jantar",
    5: "Ceia",
  }
  return types[type] || "Refeição"
}

// Função para obter a cor do tipo de refeição
const getMealTypeColor = (type: number): string => {
  const colors: { [key: number]: string } = {
    0: "bg-orange-100 text-orange-600",
    1: "bg-yellow-100 text-yellow-600",
    2: "bg-green-100 text-green-600",
    3: "bg-blue-100 text-blue-600",
    4: "bg-purple-100 text-purple-600",
    5: "bg-pink-100 text-pink-600",
  }
  return colors[type] || "bg-gray-100 text-gray-600"
}

export default function ClientDiet() {
  const isMobile = useMobile()
  const { currentDiet, meals, progress, loading, error, fetchCurrentDiet, currentUser } = useClientDiet()
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState("")

  const toggleMeal = (mealId: number) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId)
  }

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      toast.error("Digite seu feedback antes de enviar")
      return
    }

    // Aqui você pode implementar o envio do feedback
    console.log("Enviando feedback:", feedback)
    toast.success("Feedback enviado com sucesso!")
    setFeedback("")
    setIsFeedbackOpen(false)
  }

  const getTodayMeals = () => {
    // Para este exemplo, vamos mostrar todas as refeições
    // Em uma implementação real, você filtraria por data
    return meals
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-3 md:p-6">
          <div className="mb-4 md:mb-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <div className="grid grid-cols-3 gap-2 md:hidden">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-lg" />
            </div>

            {/* Metas da Dieta */}
            <Card className="border-none shadow-sm mb-4">
              <CardHeader>
                <CardTitle>Metas</CardTitle>
                <CardDescription>Alvos diários da sua dieta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Calorias</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyCalories ?? "-"} kcal</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Proteínas</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyProtein ?? "-"} g</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Carboidratos</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyCarbs ?? "-"} g</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Gorduras</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyFat ?? "-"} g</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Fibra</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyFiber ?? "-"} g</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Sódio</div>
                    <div className="text-lg font-bold">{currentDiet?.dailySodium ?? "-"} mg</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progresso da Dieta */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Progresso</CardTitle>
                <CardDescription>Acompanhe seus registros mais recentes</CardDescription>
              </CardHeader>
              <CardContent>
                {progress && progress.length > 0 ? (
                  <div className="space-y-3">
                    {progress.slice(0, 5).map((p) => (
                      <div key={p.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(p.date).toLocaleDateString("pt-BR")}</span>
                          <span>
                            {p.mealsCompleted}/{p.totalMeals} refeições • {Math.round(p.completionPercentage)}%
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Peso</div>
                            <div className="font-medium">{p.weight ?? "-"} kg</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Calorias consumidas</div>
                            <div className="font-medium">{p.caloriesConsumed ?? "-"} kcal</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Energia • Fome • Satisfação</div>
                            <div className="font-medium">
                              {p.energyLevel ?? "-"} • {p.hungerLevel ?? "-"} • {p.satisfactionLevel ?? "-"}
                            </div>
                          </div>
                        </div>
                        {p.notes && <div className="mt-2 text-xs text-gray-600">Notas: {p.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum progresso registrado ainda.</p>
                )}
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentDiet) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-3 md:p-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 md:text-3xl">
              {isMobile ? "Minha Dieta" : "Meu Plano Alimentar"}
            </h1>
            {currentUser && (
              <p className="text-xs text-gray-600 md:text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Olá, {currentUser.name}
              </p>
            )}
          </div>

          <Alert className="max-w-2xl">
            <AlertDescription className="flex items-center justify-between">
              <span>{error || "Você ainda não possui uma dieta ativa. Entre em contato com seu nutricionista."}</span>
              <Button variant="outline" size="sm" onClick={fetchCurrentDiet} className="ml-4 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const todayMeals = getTodayMeals()

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="p-3 md:p-6">
        {/* Header Mobile Otimizado */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 md:text-3xl">
                {isMobile ? "Minha Dieta" : "Meu Plano Alimentar"}
              </h1>
              <p className="text-xs text-gray-600 md:text-base flex items-center gap-2">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                {currentUser?.name} • {currentDiet?.name}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`${
                currentDiet?.status === 1
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-500 bg-gray-50 text-gray-700"
              }`}
            >
              {getDietStatusLabel(currentDiet?.status)}
            </Badge>
          </div>

          {/* Stats Mobile Compacto */}
          <div className="grid grid-cols-3 gap-2 md:hidden">
            <div className="bg-white rounded-lg p-2 text-center border">
              <div className="text-lg font-bold text-[#df0e67]">{currentDiet?.dailyCalories}</div>
              <div className="text-xs text-gray-500">kcal/dia</div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border">
              <div className="text-lg font-bold text-blue-600">{currentDiet?.dailyProtein}g</div>
              <div className="text-xs text-gray-500">proteína</div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border">
              <div className="text-lg font-bold text-green-600">{todayMeals.length}</div>
              <div className="text-xs text-gray-500">refeições</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm">
              {/* Header do Card - Desktop */}
              {!isMobile && (
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl">{currentDiet?.name}</CardTitle>
                    <CardDescription>
                      {currentDiet?.description} • Atualizado em{" "}
                      {new Date(currentDiet?.updatedAt).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#df0e67] bg-[#df0e67]/10 px-3 py-1 text-[#df0e67]">
                      {currentDiet?.dailyCalories ?? "-"} kcal/dia
                    </Badge>
                  </div>
                </CardHeader>
              )}

              <CardContent className="p-3 md:p-6">
                {/* Stats Desktop */}
                {!isMobile && (
                  <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#df0e67]/10">
                        <Target className="h-5 w-5 text-[#df0e67]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Calorias</p>
                        <p className="text-lg font-bold">{currentDiet?.dailyCalories}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Proteína</p>
                        <p className="text-lg font-bold">{currentDiet?.dailyProtein}g</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Carboidratos</p>
                        <p className="text-lg font-bold">{currentDiet?.dailyCarbs}g</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Droplets className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Gorduras</p>
                        <p className="text-lg font-bold">{currentDiet?.dailyFat}g</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header do Dia */}
                <div className="flex items-center justify-between bg-white rounded-lg p-3 border md:bg-transparent md:border-0 md:p-0 mb-4">
                  <div>
                    <h3 className="text-base font-medium md:text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Suas Refeições
                    </h3>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {todayMeals.length} refeições programadas
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchCurrentDiet} className="h-8 w-8 p-0 bg-transparent">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Refeições */}
                <div className="space-y-2 md:space-y-4">
                  {todayMeals.length > 0 ? (
                    todayMeals.map((meal) => (
                      <div key={meal.id} className="overflow-hidden rounded-lg border bg-white">
                        {/* Header da Refeição */}
                        <div
                          className={`flex cursor-pointer items-center justify-between p-3 md:p-4 transition-all duration-200 hover:bg-gray-50 ${
                            expandedMeal === meal.id ? "border-b bg-gray-50" : ""
                          }`}
                          onClick={() => toggleMeal(meal.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full ${getMealTypeColor(meal?.type ?? 0)}`}
                              >
                                <Utensils className="h-5 w-5 md:h-6 md:w-6" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm md:text-base">
                                  {meal.typeDescription ?? getMealTypeLabel(meal.type)}
                                </h4>
                                {meal.scheduledTime && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {meal?.scheduledTime}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 md:text-sm">{meal.totalCalories} kcal</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isMobile && (
                              <div className="text-right">
                                <div className="text-sm font-medium text-[#df0e67]">{meal.totalCalories}</div>
                                <div className="text-xs text-gray-400">kcal</div>
                              </div>
                            )}
                            {expandedMeal === meal.id ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Conteúdo Expandido */}
                        {expandedMeal === meal.id && (
                          <div className="p-3 md:p-4 bg-gray-50">
                            <div className="space-y-2 md:space-y-3">
                              {meal.foods && meal.foods.length > 0 ? (
                                meal.foods.map((food, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between rounded-lg border bg-white p-2 md:p-3"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium text-sm md:text-base">{food.foodName}</p>
                                      <p className="text-xs text-gray-500 md:text-sm">
                                        {food.quantity}
                                        {food.unit}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-sm md:text-base">{food.calories} kcal</p>
                                      <p className="text-xs text-gray-500">
                                        P:{food.protein}g C:{food.carbs}g G:{food.fat}g
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <p className="text-sm">Nenhum alimento cadastrado para esta refeição</p>
                                </div>
                              )}
                            </div>

                            {meal.instructions && (
                              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <p className="text-xs font-medium md:text-sm">💡 Instruções</p>
                                <p className="text-xs md:text-sm mt-1">{meal.instructions}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Nenhuma refeição encontrada</p>
                      <p className="text-sm">
                        Suas refeições aparecerão aqui quando forem adicionadas pelo nutricionista.
                      </p>
                    </div>
                  )}
                </div>

                {/* Observações */}
                {currentDiet?.notes && (
                  <div className="mt-4 md:mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3 md:p-4">
                    <h3 className="mb-2 font-medium text-sm md:text-base">📋 Observações Importantes</h3>
                    <p className="text-xs md:text-sm">{currentDiet?.notes}</p>
                  </div>
                )}

                {/* Restrições */}
                {currentDiet?.restrictions && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 md:p-4">
                    <h3 className="mb-2 font-medium text-sm md:text-base">⚠️ Restrições Alimentares</h3>
                    <p className="text-xs md:text-sm">{currentDiet?.restrictions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Metas da Dieta */}
            <Card className="border-none shadow-sm mb-4">
              <CardHeader>
                <CardTitle>Metas</CardTitle>
                <CardDescription>Alvos diários da sua dieta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Calorias</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyCalories ?? "-"} kcal</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Proteínas</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyProtein ?? "-"} g</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Carboidratos</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyCarbs ?? "-"} g</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Gorduras</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyFat ?? "-"} g</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Fibra</div>
                    <div className="text-lg font-bold">{currentDiet?.dailyFiber ?? "-"} g</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-xs text-gray-500">Sódio</div>
                    <div className="text-lg font-bold">{currentDiet?.dailySodium ?? "-"} mg</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progresso da Dieta */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Progresso</CardTitle>
                <CardDescription>Acompanhe seus registros mais recentes</CardDescription>
              </CardHeader>
              <CardContent>
                {progress && progress.length > 0 ? (
                  <div className="space-y-3">
                    {progress.slice(0, 5).map((p) => (
                      <div key={p.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(p.date).toLocaleDateString("pt-BR")}</span>
                          <span>
                            {p.mealsCompleted}/{p.totalMeals} refeições • {Math.round(p.completionPercentage)}%
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Peso</div>
                            <div className="font-medium">{p.weight ?? "-"} kg</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Calorias consumidas</div>
                            <div className="font-medium">{p.caloriesConsumed ?? "-"} kcal</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Energia • Fome • Satisfação</div>
                            <div className="font-medium">
                              {p.energyLevel ?? "-"} • {p.hungerLevel ?? "-"} • {p.satisfactionLevel ?? "-"}
                            </div>
                          </div>
                        </div>
                        {p.notes && <div className="mt-2 text-xs text-gray-600">Notas: {p.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum progresso registrado ainda.</p>
                )}
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Feedback</CardTitle>
                <CardDescription className="text-xs md:text-sm">Como está o plano?</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {!isMobile && (
                    <p className="text-sm">Está conseguindo seguir o plano? Compartilhe com seu nutricionista.</p>
                  )}

                  <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-10 md:h-12 bg-[#df0e67] hover:bg-[#c00c5a] text-sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Enviar Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] mx-4">
                      <DialogHeader>
                        <DialogTitle>Enviar Feedback</DialogTitle>
                        <DialogDescription>Compartilhe suas impressões sobre o plano alimentar.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Textarea
                          placeholder="Digite seu feedback aqui..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="min-h-[100px] md:min-h-[150px]"
                        />
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsFeedbackOpen(false)}
                          className="flex-1 md:flex-none"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSendFeedback}
                          className="bg-[#df0e67] hover:bg-[#c00c5a] flex-1 md:flex-none"
                        >
                          Enviar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
