"use client"

import { DialogDescription } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Loader2, Calendar, ChefHat, User, Edit3, Clock, Plus, Trash2, Check } from "lucide-react"
import { useDiets } from "@/hooks/use-diet"
import FoodPickerModal from "@/components/food/FoodPickerModal"
import { type ApiDiet, type DietStatus, MealType, getDietStatusLabel, type CreateMealFoodRequest } from "@/types/diet"
import { toast } from "sonner"
import { mealService, type Meal } from "@/services/meal-service"

interface DietDetailsPageProps {
  dietId: string
}

export default function DietDetailsPage({ dietId }: DietDetailsPageProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("overview")
  const [diet, setDiet] = useState<ApiDiet | null>(null)
  const [editedDiet, setEditedDiet] = useState<ApiDiet | null>(null)
  const [isChangeClientOpen, setIsChangeClientOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { getDietById, updateDiet } = useDiets()

  const [isAddMealOpen, setIsAddMealOpen] = useState(false)
  const [isEditMealOpen, setIsEditMealOpen] = useState(false)
  const [editMeal, setEditMeal] = useState<any | null>(null)
  const [isFoodPickerOpen, setIsFoodPickerOpen] = useState(false)
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false)
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null)

  const [newMeal, setNewMeal] = useState({
    name: "",
    type: MealType.BREAKFAST,
    scheduledTime: "08:00:00",
    instructions: "",
    foods: [],
  })

  const [newProgress, setNewProgress] = useState({
    date: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
    weight: 0,
    caloriesConsumed: 0,
    mealsCompleted: 0,
    totalMeals: 0,
    notes: "",
    energyLevel: 5,
    hungerLevel: 5,
    satisfactionLevel: 5,
  })

  const [meals, setMeals] = useState<Meal[]>([])
  const [mealsLoading, setMealsLoading] = useState(false)

  const [progress, setProgress] = useState<any[]>([])
  const [progressLoading, setProgressLoading] = useState(false)

  // Carregar dados da dieta
  useEffect(() => {
    if (dietId) {
      loadDietData()
    }
  }, [dietId])

  useEffect(() => {
    if (diet) {
      setEditedDiet({ ...diet })
      loadMeals()
      loadProgress()
    }
  }, [diet])

  const loadDietData = async () => {
    if (!dietId) return

    try {
      setLoading(true)
      const dietData = await getDietById(Number(dietId))
      setDiet(dietData)
    } catch (error) {
      console.error("Erro ao carregar dieta:", error)
      toast.error("Não foi possível carregar os dados da dieta.")
    } finally {
      setLoading(false)
    }
  }

  
  const openEditMeal = (meal: any) => {
    setEditMeal({
      id: meal.id,
      name: meal.name || "",
      type: meal.type ?? 0,
      scheduledTime: meal.scheduledTime || "08:00:00",
      instructions: meal.instructions || "",
      foods: (meal.foods || []).map((f: any) => ({
        id: f.id,
        mealId: meal.id,
        foodId: f.foodId,
        quantity: f.quantity,
        unit: f.unit
      }))
    })
    setIsEditMealOpen(true)
  }

  const handleUpdateMeal = async () => {
    if (!diet || !editMeal) return
    try {
      await mealService.updateMeal(diet.id, editMeal.id, {
        name: editMeal.name,
        type: editMeal.type,
        scheduledTime: editMeal.scheduledTime,
        instructions: editMeal.instructions,
        foods: editMeal.foods
      })
      await loadMeals()
      setIsEditMealOpen(false)
    } catch (error) {
      console.error("Erro ao atualizar refeição:", error)
      toast.error("Não foi possível atualizar a refeição.")
    }
  }
const loadMeals = async () => {
    if (!diet) return

    try {
      setMealsLoading(true)
      const mealsData = await mealService.getMealsByDiet(diet.id)
      setMeals(mealsData)
    } catch (error) {
      console.error("Erro ao carregar refeições:", error)
      toast.error("Não foi possível carregar as refeições.")
    } finally {
      setMealsLoading(false)
    }
  }

  const loadProgress = async () => {
    if (!diet) return

    try {
      setProgressLoading(true)
      const progressData = await mealService.getProgressByDiet(diet.id)
      setProgress(progressData)
    } catch (error) {
      console.error("Erro ao carregar progresso:", error)
      toast.error("Não foi possível carregar o progresso.")
    } finally {
      setProgressLoading(false)
    }
  }

  const handleSaveDiet = async () => {
    if (!editedDiet) return

    try {
      setSaving(true)
      await updateDiet(editedDiet.id, {
        name: editedDiet.name,
        description: editedDiet.description,
        clientId: editedDiet.clientId,
        startDate: editedDiet.startDate,
        endDate: editedDiet.endDate,
        status: editedDiet.status,
        dailyCalories: editedDiet.dailyCalories,
        dailyProtein: editedDiet.dailyProtein,
        dailyCarbs: editedDiet.dailyCarbs,
        dailyFat: editedDiet.dailyFat,
        dailyFiber: editedDiet.dailyFiber,
        dailySodium: editedDiet.dailySodium,
        restrictions: editedDiet.restrictions,
        notes: editedDiet.notes,
      })

      setDiet(editedDiet)
      setEditOpen(false)
      toast.success("Dieta atualizada com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar dieta:", error)
      toast.error("Não foi possível salvar as alterações.")
    } finally {
      setSaving(false)
    }
  }

  const handleAddMeal = async () => {
    if (!diet) return

    try {
      await mealService.createMeal(diet.id, newMeal)
      await loadMeals() // Reload meals after creation

      setNewMeal({
        name: "",
        type: 0,
        scheduledTime: "08:00:00",
        instructions: "",
        foods: [],
      })
      setIsAddMealOpen(false)

      toast.success("Refeição adicionada com sucesso!")
    } catch (error) {
      console.error("Erro ao adicionar refeição:", error)
      toast.error("Não foi possível adicionar a refeição.")
    }
  }

  const handleDeleteMeal = async (mealId: number) => {
    try {
      await mealService.deleteMeal(diet.id, mealId)
      await loadMeals() // Reload meals after deletion
      toast.success("Refeição removida com sucesso!")
    } catch (error) {
      console.error("Erro ao remover refeição:", error)
      toast.error("Não foi possível remover a refeição.")
    }
  }

  const handleCompleteMeal = async (mealId: number) => {
    try {
      await mealService.completeMeal(mealId)
      await loadMeals() // Reload meals after completion
      toast.success("Refeição marcada como concluída!")
    } catch (error) {
      console.error("Erro ao completar refeição:", error)
      toast.error("Não foi possível completar a refeição.")
    }
  }

  const handleAddProgress = async () => {
    if (!diet) return

    try {
      await mealService.addProgress(diet.id, newProgress)

      setNewProgress({
        date: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
        weight: 0,
        caloriesConsumed: 0,
        mealsCompleted: 0,
        totalMeals: 0,
        notes: "",
        energyLevel: 5,
        hungerLevel: 5,
        satisfactionLevel: 5,
      })
      setIsAddProgressOpen(false)

      toast.success("Progresso adicionado com sucesso!")
    } catch (error) {
      console.error("Erro ao adicionar progresso:", error)
      toast.error("Não foi possível adicionar o progresso.")
    }
  }

  const handleFoodSelection = (selectedFoods: CreateMealFoodRequest[]) => {
    setNewMeal({ ...newMeal, foods: selectedFoods })
    setIsFoodPickerOpen(false)
  }

  if (loading) {
    return (

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!diet) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Dieta não encontrada</h2>
          <p className="text-gray-600 mt-2">A dieta solicitada não existe ou foi removida.</p>
          <Button onClick={() => router.push("/admin/diets")} className="mt-4">
            Voltar para Dietas
          </Button>
        </div>
      </div>
    )
  }

  const getDietStatusColor = (status: DietStatus) => {
    const colors = {
      0: "bg-gray-500", // Rascunho
      1: "bg-green-500", // Ativa
      2: "bg-yellow-500", // Pausada
      3: "bg-blue-500", // Concluída
      4: "bg-red-500", // Cancelada
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Diet Info */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                <AvatarImage src={diet.clientAvatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xl font-bold">
                  <ChefHat className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{diet.name}</h1>
                  <Badge className={`${getDietStatusColor(diet.status)} text-white border-0`}>
                    {getDietStatusLabel(diet.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{diet.clientName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Início: {new Date(diet.startDate).toLocaleDateString()}</span>
                  </div>
                  {diet.endDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Fim: {new Date(diet.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={() => setEditOpen(true)} variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="meals">Refeições</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Calorias Diárias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{diet.dailyCalories || 0}</div>
                  <p className="text-xs text-gray-500">kcal</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Proteína</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{diet.dailyProtein || 0}g</div>
                  <p className="text-xs text-gray-500">por dia</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Carboidratos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{diet.dailyCarbs || 0}g</div>
                  <p className="text-xs text-gray-500">por dia</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Gordura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{diet.dailyFat || 0}g</div>
                  <p className="text-xs text-gray-500">por dia</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Dieta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                    <p className="text-sm text-gray-900 mt-1">{diet.description || "Nenhuma descrição fornecida"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Restrições Alimentares</Label>
                    <p className="text-sm text-gray-900 mt-1">{diet.restrictions || "Nenhuma restrição"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Observações</Label>
                    <p className="text-sm text-gray-900 mt-1">{diet.notes || "Nenhuma observação"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações Nutricionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fibra</Label>
                      <p className="text-sm text-gray-900 mt-1">{diet.dailyFiber || 0}g</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Sódio</Label>
                      <p className="text-sm text-gray-900 mt-1">{diet.dailySodium || 0}mg</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Período</Label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(diet.startDate).toLocaleDateString()} -{" "}
                      {diet.endDate ? new Date(diet.endDate).toLocaleDateString() : "Em andamento"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Refeições</h3>
              <Button onClick={() => setIsAddMealOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Refeição
              </Button>
            </div>

            {mealsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            ) : meals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map((meal) => {
                  const mealTypeOptions = mealService.getMealTypeOptions()
                  const mealTypeInfo = mealTypeOptions.find((option) => option.value === meal.type)

                  return (
                    <Card key={meal.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{mealTypeInfo?.icon || "🍽️"}</div>
                            <div>
                              <CardTitle className="text-lg font-semibold">{meal.name}</CardTitle>
                              <Badge className={`${mealTypeInfo?.color || "bg-gray-100 text-gray-800"} text-xs`}>
                                {meal.typeDescription}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {!meal.isCompleted && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 bg-transparent"
                                onClick={() => handleCompleteMeal(meal.id!)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                                                        <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 bg-transparent"
                              onClick={() => openEditMeal(meal)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
<Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 bg-transparent"
                              onClick={() => handleDeleteMeal(meal.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{meal.scheduledTime}</span>
                          {meal.isCompleted && (
                            <Badge className="bg-green-100 text-green-800 text-xs ml-auto">Concluída</Badge>
                          )}
                        </div>

                        {meal.instructions && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{meal.instructions}</p>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-blue-50 p-2 rounded">
                            <div className="font-medium text-blue-800">{meal.totalCalories || 0}</div>
                            <div className="text-blue-600 text-xs">Calorias</div>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <div className="font-medium text-green-800">{meal.totalProtein || 0}g</div>
                            <div className="text-green-600 text-xs">Proteína</div>
                          </div>
                        </div>

                        {meal.foods && meal.foods.length > 0 && (
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">Alimentos</span>
                              <Badge variant="secondary" className="text-xs">
                                {meal.foods.length} item{meal.foods.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <div className="mt-2 space-y-1">
                              {meal.foods.slice(0, 2).map((food, index) => (
                                <div key={index} className="text-xs text-gray-600 flex justify-between">
                                  <span>{food.foodName || `Alimento ${food.foodId}`}</span>
                                  <span>
                                    {food.quantity}
                                    {food.unit}
                                  </span>
                                </div>
                              ))}
                              {meal.foods.length > 2 && (
                                <div className="text-xs text-gray-500">+{meal.foods.length - 2} mais...</div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma refeição cadastrada</h3>
                  <p className="text-gray-500 mb-4">Comece adicionando a primeira refeição desta dieta</p>
                  <Button onClick={() => setIsAddMealOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Refeição
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Progresso</h3>
              <Button onClick={() => setIsAddProgressOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Progresso
              </Button>
            </div>

            {progressLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            ) : progress.length > 0 ? (
              <div className="space-y-4">
                {progress.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Data</Label>
                          <p className="text-sm text-gray-900">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Peso</Label>
                          <p className="text-sm text-gray-900">{entry.weight}kg</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Calorias Consumidas</Label>
                          <p className="text-sm text-gray-900">{entry.caloriesConsumed} kcal</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Refeições</Label>
                          <p className="text-sm text-gray-900">
                            {entry.mealsCompleted}/{entry.totalMeals}
                          </p>
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium text-gray-600">Observações</Label>
                          <p className="text-sm text-gray-900">{entry.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum progresso registrado</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Dieta</DialogTitle>
            <DialogDescription>Atualize as informações básicas da dieta.</DialogDescription>
          </DialogHeader>

          {editedDiet && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dietName">Nome</Label>
                  <Input
                    id="dietName"
                    value={editedDiet.name || ""}
                    onChange={(e) => setEditedDiet({ ...editedDiet, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietStatus">Status</Label>
                  <Select
                    value={String(editedDiet.status ?? 0)}
                    onValueChange={(v) => setEditedDiet({ ...editedDiet, status: Number(v) as any })}
                  >
                    <SelectTrigger id="dietStatus">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Rascunho</SelectItem>
                      <SelectItem value="1">Ativa</SelectItem>
                      <SelectItem value="2">Pausada</SelectItem>
                      <SelectItem value="3">Concluída</SelectItem>
                      <SelectItem value="4">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietStart">Início</Label>
                  <Input
                    id="dietStart"
                    type="date"
                    value={(editedDiet.startDate || "").slice(0, 10)}
                    onChange={(e) => setEditedDiet({ ...editedDiet, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietEnd">Fim</Label>
                  <Input
                    id="dietEnd"
                    type="date"
                    value={(editedDiet.endDate || "").slice(0, 10)}
                    onChange={(e) => setEditedDiet({ ...editedDiet, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietDesc">Descrição</Label>
                <Textarea
                  id="dietDesc"
                  rows={3}
                  value={editedDiet.description || ""}
                  onChange={(e) => setEditedDiet({ ...editedDiet, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Calorias/dia</Label>
                  <Input
                    type="number"
                    value={Number.isFinite(editedDiet.dailyCalories as any) ? String(editedDiet.dailyCalories) : ""}
                    onChange={(e) => setEditedDiet({ ...editedDiet, dailyCalories: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proteína (g)</Label>
                  <Input
                    type="number"
                    value={Number.isFinite(editedDiet.dailyProtein as any) ? String(editedDiet.dailyProtein) : ""}
                    onChange={(e) => setEditedDiet({ ...editedDiet, dailyProtein: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carboidrato (g)</Label>
                  <Input
                    type="number"
                    value={Number.isFinite(editedDiet.dailyCarbs as any) ? String(editedDiet.dailyCarbs) : ""}
                    onChange={(e) => setEditedDiet({ ...editedDiet, dailyCarbs: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gordura (g)</Label>
                  <Input
                    type="number"
                    value={Number.isFinite(editedDiet.dailyFat as any) ? String(editedDiet.dailyFat) : ""}
                    onChange={(e) => setEditedDiet({ ...editedDiet, dailyFat: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fibra (g)</Label>
                  <Input
                    type="number"
                    value={Number.isFinite(editedDiet.dailyFiber as any) ? String(editedDiet.dailyFiber) : ""}
                    onChange={(e) => setEditedDiet({ ...editedDiet, dailyFiber: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sódio (mg)</Label>
                  <Input
                    type="number"
                    value={Number.isFinite(editedDiet.dailySodium as any) ? String(editedDiet.dailySodium) : ""}
                    onChange={(e) => setEditedDiet({ ...editedDiet, dailySodium: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietRestrictions">Restrições</Label>
                <Textarea
                  id="dietRestrictions"
                  rows={2}
                  value={editedDiet.restrictions || ""}
                  onChange={(e) => setEditedDiet({ ...editedDiet, restrictions: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietNotes">Observações</Label>
                <Textarea
                  id="dietNotes"
                  rows={2}
                  value={editedDiet.notes || ""}
                  onChange={(e) => setEditedDiet({ ...editedDiet, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button type="button" onClick={handleSaveDiet}>
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

<Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Refeição</DialogTitle>
            <DialogDescription>Crie uma nova refeição para esta dieta</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mealName">Nome da Refeição</Label>
                <Input
                  id="mealName"
                  placeholder="Ex: Café da manhã"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealType">Tipo</Label>
                <Select
                  value={newMeal.type.toString()}
                  onValueChange={(value) => setNewMeal({ ...newMeal, type: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealService.getMealTypeOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Horário</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={newMeal.scheduledTime}
                onChange={(e) => setNewMeal({ ...newMeal, scheduledTime: e.target.value + ":00" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instruções</Label>
              <Textarea
                id="instructions"
                placeholder="Instruções de preparo ou consumo..."
                rows={3}
                value={newMeal.instructions}
                onChange={(e) => setNewMeal({ ...newMeal, instructions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Alimentos</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsFoodPickerOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Alimentos
                </Button>
              </div>

              {newMeal.foods && newMeal.foods.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {newMeal.foods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1">
                        <span className="text-sm font-medium">Alimento ID: {food.foodId}</span>
                        <div className="text-xs text-gray-500">
                          {food.quantity} {food.unit}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => {
                          const updatedFoods = newMeal.foods?.filter((_, i) => i !== index) || []
                          setNewMeal({ ...newMeal, foods: updatedFoods })
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-sm text-gray-500">Nenhum alimento adicionado</p>
                  <p className="text-xs text-gray-400">Clique em "Adicionar Alimentos" para começar</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddMealOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMeal} disabled={mealsLoading}>
              {mealsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Refeição
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFoodPickerOpen} onOpenChange={setIsFoodPickerOpen}>
        <FoodPickerModal
          open={isFoodPickerOpen}
          onOpenChange={setIsFoodPickerOpen}
          onConfirm={handleFoodSelection}
          initial={newMeal.foods || []}
        />
      </Dialog>

      <Dialog open={isAddProgressOpen} onOpenChange={setIsAddProgressOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Progresso</DialogTitle>
            <DialogDescription>Registre o progresso do cliente nesta dieta</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="progressDate">Data</Label>
                <Input
                  id="progressDate"
                  type="date"
                  value={newProgress.date.split("T")[0]}
                  onChange={(e) => setNewProgress({ ...newProgress, date: e.target.value + "T00:00:00.000Z" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={newProgress.weight || ""}
                  onChange={(e) => setNewProgress({ ...newProgress, weight: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caloriesConsumed">Calorias Consumidas</Label>
                <Input
                  id="caloriesConsumed"
                  type="number"
                  placeholder="2000"
                  value={newProgress.caloriesConsumed || ""}
                  onChange={(e) => setNewProgress({ ...newProgress, caloriesConsumed: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealsCompleted">Refeições Concluídas</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="3"
                    value={newProgress.mealsCompleted || ""}
                    onChange={(e) => setNewProgress({ ...newProgress, mealsCompleted: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Total: 5"
                    value={newProgress.totalMeals || ""}
                    onChange={(e) => setNewProgress({ ...newProgress, totalMeals: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="energyLevel">Nível de Energia (1-10)</Label>
                <Input
                  id="energyLevel"
                  type="number"
                  min="1"
                  max="10"
                  value={newProgress.energyLevel}
                  onChange={(e) => setNewProgress({ ...newProgress, energyLevel: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hungerLevel">Nível de Fome (1-10)</Label>
                <Input
                  id="hungerLevel"
                  type="number"
                  min="1"
                  max="10"
                  value={newProgress.hungerLevel}
                  onChange={(e) => setNewProgress({ ...newProgress, hungerLevel: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="satisfactionLevel">Satisfação (1-10)</Label>
                <Input
                  id="satisfactionLevel"
                  type="number"
                  min="1"
                  max="10"
                  value={newProgress.satisfactionLevel}
                  onChange={(e) => setNewProgress({ ...newProgress, satisfactionLevel: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progressNotes">Observações</Label>
              <Textarea
                id="progressNotes"
                placeholder="Como se sentiu hoje? Dificuldades, conquistas..."
                rows={3}
                value={newProgress.notes}
                onChange={(e) => setNewProgress({ ...newProgress, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddProgressOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProgress} disabled={progressLoading}>
              {progressLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Progresso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
<Dialog open={isEditMealOpen} onOpenChange={setIsEditMealOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Refeição</DialogTitle>
            <DialogDescription>Altere as informações da refeição e salve para atualizar.</DialogDescription>
          </DialogHeader>

          {editMeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Nome</Label>
                  <Input id="editName" value={editMeal.name} onChange={(e) => setEditMeal({ ...editMeal, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editType">Tipo</Label>
                  <Select
                    value={String(editMeal.type)}
                    onValueChange={(v) => setEditMeal({ ...editMeal, type: Number(v) })}
                  >
                    <SelectTrigger id="editType">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealService.getMealTypeOptions().map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTime">Horário</Label>
                  <Input
                    id="editTime"
                    type="time"
                    value={(editMeal.scheduledTime || "").slice(0,5)}
                    onChange={(e) => setEditMeal({ ...editMeal, scheduledTime: e.target.value + (e.target.value.length===5 ? ':00' : '') })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editInstructions">Instruções</Label>
                <Textarea
                  id="editInstructions"
                  rows={3}
                  value={editMeal.instructions}
                  onChange={(e) => setEditMeal({ ...editMeal, instructions: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Alimentos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEditMeal({
                        ...editMeal,
                        foods: [...(editMeal.foods || []), { foodId: 0, quantity: 0, unit: "g" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar alimento
                  </Button>
                </div>

                {(!editMeal.foods || editMeal.foods.length === 0) && (
                  <p className="text-sm text-muted-foreground">Nenhum alimento adicionado.</p>
                )}

                {editMeal.foods && editMeal.foods.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    {editMeal.foods.map((f: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border">
                        <div className="col-span-4">
                          <Label className="text-xs">Food ID</Label>
                          <Input
                            value={String(f.foodId ?? 0)}
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0
                              const clone = [...editMeal.foods]
                              clone[idx] = { ...clone[idx], foodId: v }
                              setEditMeal({ ...editMeal, foods: clone })
                            }}
                          />
                        </div>
                        <div className="col-span-4">
                          <Label className="text-xs">Quantidade</Label>
                          <Input
                            value={String(f.quantity ?? 0)}
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0
                              const clone = [...editMeal.foods]
                              clone[idx] = { ...clone[idx], quantity: v }
                              setEditMeal({ ...editMeal, foods: clone })
                            }}
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs">Unidade</Label>
                          <Input
                            value={f.unit || "g"}
                            onChange={(e) => {
                              const clone = [...editMeal.foods]
                              clone[idx] = { ...clone[idx], unit: e.target.value }
                              setEditMeal({ ...editMeal, foods: clone })
                            }}
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              const clone = [...(editMeal.foods || [])]
                              clone.splice(idx, 1)
                              setEditMeal({ ...editMeal, foods: clone })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsEditMealOpen(false)}>Cancelar</Button>
                <Button onClick={handleUpdateMeal}>
                  <Save className="mr-2 h-4 w-4" /> Salvar alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
      
  
  

  )


}