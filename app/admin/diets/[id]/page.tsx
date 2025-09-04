"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FoodPickerModal from "@/components/food/FoodPickerModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  Loader2,
  Calendar,
  Target,
  TrendingUp,
  ChefHat,
  ListChecks,
  Activity,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDiets, useDietMeals, useDietProgress } from "@/hooks/use-diet"
import { useClients } from "@/hooks/use-client"
import {
  type ApiDiet,
  type DietStatus,
  MealType,
  getDietStatusLabel,
  getDietStatusColor,
  getMealTypeLabel,
  type CreateMealRequest,
  type CreateProgressRequest,
} from "@/types/diet"
import { toast } from "sonner"

export default function DietDetailsPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const dietId = Number(params?.id)
const [activeTab, setActiveTab] = useState("overview")
  const [diet, setDiet] = useState<ApiDiet | null>(null)
  const [isChangeClientOpen, setIsChangeClientOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { getDietById, updateDiet } = useDiets()
  const { clients, fetchClients } = useClients()
  const {
    meals,
    loading: mealsLoading,
    creating: creatingMeal,
    updating: updatingMeal,
    deleting: deletingMeal,
    fetchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
    completeMeal,
  } = useDietMeals()

  const {
    progress,
    loading: progressLoading,
    creating: creatingProgress,
    fetchProgress,
    addProgress,
  } = useDietProgress()

  const [isAddMealOpen, setIsAddMealOpen] = useState(false)
  const [isFoodPickerOpen, setIsFoodPickerOpen] = useState(false)
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false)
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null)

  const [newMeal, setNewMeal] = useState<CreateMealRequest>({
    name: "",
    type: MealType.BREAKFAST,
    scheduledTime: "08:00:00",
    instructions: "",
    foods: [],
  })

  const [newProgress, setNewProgress] = useState<CreateProgressRequest>({
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

  // Carregar dados da dieta
  useEffect(() => {
    loadDietData()
  }, [dietId])

  const loadDietData = async () => {
    try {
      setLoading(true)
      const dietData = await getDietById(dietId)
      setDiet(dietData)

      // Carregar dados relacionados
      await Promise.all([fetchMeals(dietId), fetchProgress(dietId)])
    } catch (error) {
      console.error("Erro ao carregar dieta:", error)
      toast.error("Não foi possível carregar os dados da dieta.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDiet = async () => {
    if (!diet) return

    try {
      setSaving(true)
      await updateDiet(diet.id, {
        name: diet.name,
        description: diet.description,
        clientId: diet.clientId,
        startDate: diet.startDate,
        endDate: diet.endDate,
        status: diet.status,
        dailyCalories: diet.dailyCalories,
        dailyProtein: diet.dailyProtein,
        dailyCarbs: diet.dailyCarbs,
        dailyFat: diet.dailyFat,
        dailyFiber: diet.dailyFiber,
        dailySodium: diet.dailySodium,
        restrictions: diet.restrictions,
        notes: diet.notes,
      })

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
      await createMeal(diet.id, newMeal)

      setNewMeal({
        name: "",
        type: MealType.BREAKFAST,
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
      await deleteMeal(mealId)
      toast.success("Refeição removida com sucesso!")
    } catch (error) {
      console.error("Erro ao remover refeição:", error)
      toast.error("Não foi possível remover a refeição.")
    }
  }

  const handleCompleteMeal = async (mealId: number) => {
    try {
      await completeMeal(mealId)
      toast.success("Refeição marcada como concluída!")
    } catch (error) {
      console.error("Erro ao completar refeição:", error)
      toast.error("Não foi possível completar a refeição.")
    }
  }

  const handleAddProgress = async () => {
    if (!diet) return

    try {
      await addProgress(diet.id, newProgress)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!diet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold">Dieta não encontrada</h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{diet.name}</h1>
          <Badge variant="outline" className={getDietStatusColor(diet.status)}>
            {getDietStatusLabel(diet.status)}
          </Badge>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveDiet} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="sticky top-16 z-10 w-full bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/40 border rounded-xl shadow-sm flex flex-wrap">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
          >
            <ChefHat className="mr-2 h-4 w-4" /> Dieta
          </TabsTrigger>
          <TabsTrigger
            value="meals"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
          >
            <ListChecks className="mr-2 h-4 w-4" /> Refeições
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
          >
            <Activity className="mr-2 h-4 w-4" /> Progresso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>Detalhes básicos do plano alimentar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="diet-name">Nome da Dieta</Label>
                    <Input
                      id="diet-name"
                      value={diet.name}
                      onChange={(e) => setDiet({ ...diet, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="diet-status">Status</Label>
                    <Select
                      value={diet.status.toString()}
                      onValueChange={(value) => setDiet({ ...diet, status: Number(value) as DietStatus })}
                    >
                      <SelectTrigger id="diet-status">
                        <SelectValue placeholder="Selecione o status" />
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

                  <div>
                    <Label htmlFor="diet-client">Cliente</Label>
                    <div className="flex items-center gap-2">
                      <Input id="diet-client" value={diet.clientName} readOnly className="bg-gray-50" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsChangeClientOpen(true)
                          fetchClients()
                        }}
                      >
                        Trocar
                      </Button>
                    </div>
                  </div>

                  {/* Dialog para trocar cliente */}
                  <Dialog open={isChangeClientOpen} onOpenChange={setIsChangeClientOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Selecionar Cliente</DialogTitle>
                        <DialogDescription>Escolha um novo cliente para esta dieta</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <div className="rounded-md border max-h-80 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clients.map((c) => (
                                <TableRow key={c.id}>
                                  <TableCell>{c.name}</TableCell>
                                  <TableCell className="text-muted-foreground">{c.email || "-"}</TableCell>
                                  <TableCell>#{c.id}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => {
                                        setDiet({ ...diet, clientId: c.id, clientName: c.name } as any)
                                        setIsChangeClientOpen(false)
                                      }}
                                    >
                                      Selecionar
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {clients.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                    Nenhum cliente carregado.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="diet-start-date">Data de Início</Label>
                      <Input
                        id="diet-start-date"
                        type="date"
                        value={diet.startDate.split("T")[0]}
                        onChange={(e) => setDiet({ ...diet, startDate: e.target.value + "T00:00:00.000Z" })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="diet-end-date">Data de Término</Label>
                      <Input
                        id="diet-end-date"
                        type="date"
                        value={diet.endDate ? diet.endDate.split("T")[0] : ""}
                        onChange={(e) =>
                          setDiet({ ...diet, endDate: e.target.value ? e.target.value + "T00:00:00.000Z" : "" })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="diet-description">Descrição</Label>
                    <Textarea
                      id="diet-description"
                      value={diet.description}
                      onChange={(e) => setDiet({ ...diet, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="diet-restrictions">Restrições</Label>
                    <Textarea
                      id="diet-restrictions"
                      value={diet.restrictions}
                      onChange={(e) => setDiet({ ...diet, restrictions: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="diet-notes">Observações</Label>
                    <Textarea
                      id="diet-notes"
                      value={diet.notes}
                      onChange={(e) => setDiet({ ...diet, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Macronutrientes Diários</h4>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <Label htmlFor="diet-calories">Calorias (kcal)</Label>
                    <Input
                      id="diet-calories"
                      type="number"
                      value={diet.dailyCalories}
                      onChange={(e) => setDiet({ ...diet, dailyCalories: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diet-protein">Proteínas (g)</Label>
                    <Input
                      id="diet-protein"
                      type="number"
                      value={diet.dailyProtein}
                      onChange={(e) => setDiet({ ...diet, dailyProtein: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diet-carbs">Carboidratos (g)</Label>
                    <Input
                      id="diet-carbs"
                      type="number"
                      value={diet.dailyCarbs}
                      onChange={(e) => setDiet({ ...diet, dailyCarbs: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diet-fat">Gorduras (g)</Label>
                    <Input
                      id="diet-fat"
                      type="number"
                      value={diet.dailyFat}
                      onChange={(e) => setDiet({ ...diet, dailyFat: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diet-fiber">Fibras (g)</Label>
                    <Input
                      id="diet-fiber"
                      type="number"
                      value={diet.dailyFiber}
                      onChange={(e) => setDiet({ ...diet, dailyFiber: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diet-sodium">Sódio (mg)</Label>
                    <Input
                      id="diet-sodium"
                      type="number"
                      value={diet.dailySodium}
                      onChange={(e) => setDiet({ ...diet, dailySodium: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Meta Calórica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{diet.dailyCalories}</div>
                    <p className="text-xs text-muted-foreground">kcal por dia</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Duração
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {diet.endDate
                        ? Math.ceil(
                            (new Date(diet.endDate).getTime() - new Date(diet.startDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )
                        : "∞"}
                    </div>
                    <p className="text-xs text-muted-foreground">dias</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Refeições
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{diet.totalMeals}</div>
                    <p className="text-xs text-muted-foreground">configuradas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Progresso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{diet.completionPercentage}%</div>
                    <p className="text-xs text-muted-foreground">concluído</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refeições da Dieta</CardTitle>
              <CardDescription>Gerencie as refeições configuradas para esta dieta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as refeições</SelectItem>
                      <SelectItem value="0">Café da Manhã</SelectItem>
                      <SelectItem value="1">Lanche da Manhã</SelectItem>
                      <SelectItem value="2">Almoço</SelectItem>
                      <SelectItem value="3">Lanche da Tarde</SelectItem>
                      <SelectItem value="4">Jantar</SelectItem>
                      <SelectItem value="5">Ceia</SelectItem>
                      <SelectItem value="6">Pré-Treino</SelectItem>
                      <SelectItem value="7">Pós-Treino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Refeição
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Refeição</DialogTitle>
                      <DialogDescription>Preencha os detalhes da nova refeição.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meal-name" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="meal-name"
                          value={newMeal.name}
                          onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                          placeholder="Ex: Café da Manhã"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meal-type" className="text-right">
                          Tipo
                        </Label>
                        <Select
                          value={newMeal.type.toString()}
                          onValueChange={(value) => setNewMeal({ ...newMeal, type: Number(value) as MealType })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Café da Manhã</SelectItem>
                            <SelectItem value="1">Lanche da Manhã</SelectItem>
                            <SelectItem value="2">Almoço</SelectItem>
                            <SelectItem value="3">Lanche da Tarde</SelectItem>
                            <SelectItem value="4">Jantar</SelectItem>
                            <SelectItem value="5">Ceia</SelectItem>
                            <SelectItem value="6">Pré-Treino</SelectItem>
                            <SelectItem value="7">Pós-Treino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meal-time" className="text-right">
                          Horário
                        </Label>
                        <Input
                          id="meal-time"
                          type="time"
                          value={newMeal.scheduledTime.substring(0, 5)}
                          onChange={(e) => setNewMeal({ ...newMeal, scheduledTime: `${e.target.value}:00` })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meal-instructions" className="text-right">
                          Instruções
                        </Label>
                        <Textarea
                          id="meal-instructions"
                          value={newMeal.instructions}
                          onChange={(e) => setNewMeal({ ...newMeal, instructions: e.target.value })}
                          placeholder="Instruções para a refeição..."
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right">Alimentos</Label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => setIsFoodPickerOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" /> Adicionar alimentos
                            </Button>
                          </div>
                          {newMeal.foods && newMeal.foods.length > 0 ? (
                            <div className="rounded border">
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 p-2 text-xs text-muted-foreground">
                                <div>ID</div>
                                <div>Qtd</div>
                                <div>Un.</div>
                                <div className="md:col-span-3">—</div>
                              </div>
                              <div className="divide-y">
                                {newMeal.foods.map((f, idx) => (
                                  <div key={idx} className="grid grid-cols-4 md:grid-cols-6 gap-2 p-2 items-center">
                                    <div>#{f.foodId}</div>
                                    <div>{f.quantity}</div>
                                    <div>{f.unit}</div>
                                    <div className="md:col-span-3 text-right">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setNewMeal({ ...newMeal, foods: newMeal.foods.filter((_, i) => i !== idx) })
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Nenhum alimento adicionado.</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddMealOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddMeal}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={creatingMeal}
                      >
                        {creatingMeal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {mealsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : meals.length > 0 ? (
                <div className="grid gap-4">
                  {meals.map((meal) => (
                    <Card key={meal.id} className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{meal.name}</CardTitle>
                            <CardDescription>
                              {getMealTypeLabel(meal.type)} • {meal.scheduledTime.substring(0, 5)}
                              {meal.isCompleted && (
                                <Badge variant="outline" className="ml-2 border-green-500 text-green-600">
                                  Concluída
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {!meal.isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteMeal(meal.id)}
                                disabled={updatingMeal}
                              >
                                {updatingMeal ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                                Marcar como Concluída
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 bg-transparent"
                              onClick={() => handleDeleteMeal(meal.id)}
                              disabled={deletingMeal}
                            >
                              {deletingMeal ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1 h-4 w-4" />
                              )}
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {meal.instructions && <p className="text-sm text-muted-foreground mb-3">{meal.instructions}</p>}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Calorias:</span>
                            <div className="text-lg font-bold text-green-600">{meal.totalCalories} kcal</div>
                          </div>
                          <div>
                            <span className="font-medium">Proteínas:</span>
                            <div className="text-lg font-bold text-blue-600">{meal.totalProtein}g</div>
                          </div>
                          <div>
                            <span className="font-medium">Carboidratos:</span>
                            <div className="text-lg font-bold text-orange-600">{meal.totalCarbs}g</div>
                          </div>
                          <div>
                            <span className="font-medium">Gorduras:</span>
                            <div className="text-lg font-bold text-purple-600">{meal.totalFat}g</div>
                          </div>
                        </div>

                        {meal.foods && meal.foods.length > 0 ? (
                          <div className="mt-4 space-y-2">
                            <h5 className="font-medium">Alimentos:</h5>
                            {meal.foods.map((food, index) => (
                              <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                <span>
                                  {food.foodName} ({food.quantity} {food.unit})
                                </span>
                                <span>{food.calories} kcal</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-4">Nenhum alimento adicionado</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-medium">Nenhuma refeição configurada</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Adicione refeições para estruturar esta dieta.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso da Dieta</CardTitle>
              <CardDescription>Acompanhe o progresso do cliente nesta dieta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-4">
                  <div>
                    <Label htmlFor="progress-start-date">Data Inicial</Label>
                    <Input id="progress-start-date" type="date" className="w-[180px]" />
                  </div>
                  <div>
                    <Label htmlFor="progress-end-date">Data Final</Label>
                    <Input id="progress-end-date" type="date" className="w-[180px]" />
                  </div>
                </div>
                <Dialog open={isAddProgressOpen} onOpenChange={setIsAddProgressOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Progresso
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Progresso</DialogTitle>
                      <DialogDescription>Registre o progresso do cliente na dieta.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="progress-date" className="text-right">
                          Data
                        </Label>
                        <Input
                          id="progress-date"
                          type="date"
                          value={newProgress.date.split("T")[0]}
                          onChange={(e) => setNewProgress({ ...newProgress, date: e.target.value + "T00:00:00.000Z" })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="progress-weight" className="text-right">
                          Peso (kg)
                        </Label>
                        <Input
                          id="progress-weight"
                          type="number"
                          step="0.1"
                          value={newProgress.weight}
                          onChange={(e) => setNewProgress({ ...newProgress, weight: Number(e.target.value) })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="progress-calories" className="text-right">
                          Calorias Consumidas
                        </Label>
                        <Input
                          id="progress-calories"
                          type="number"
                          value={newProgress.caloriesConsumed}
                          onChange={(e) => setNewProgress({ ...newProgress, caloriesConsumed: Number(e.target.value) })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="progress-meals-completed">Refeições Completadas</Label>
                          <Input
                            id="progress-meals-completed"
                            type="number"
                            value={newProgress.mealsCompleted}
                            onChange={(e) => setNewProgress({ ...newProgress, mealsCompleted: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="progress-total-meals">Total de Refeições</Label>
                          <Input
                            id="progress-total-meals"
                            type="number"
                            value={newProgress.totalMeals}
                            onChange={(e) => setNewProgress({ ...newProgress, totalMeals: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="progress-energy">Nível de Energia (1-10)</Label>
                          <Input
                            id="progress-energy"
                            type="number"
                            min="1"
                            max="10"
                            value={newProgress.energyLevel}
                            onChange={(e) => setNewProgress({ ...newProgress, energyLevel: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="progress-hunger">Nível de Fome (1-10)</Label>
                          <Input
                            id="progress-hunger"
                            type="number"
                            min="1"
                            max="10"
                            value={newProgress.hungerLevel}
                            onChange={(e) => setNewProgress({ ...newProgress, hungerLevel: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="progress-satisfaction">Satisfação (1-10)</Label>
                          <Input
                            id="progress-satisfaction"
                            type="number"
                            min="1"
                            max="10"
                            value={newProgress.satisfactionLevel}
                            onChange={(e) =>
                              setNewProgress({ ...newProgress, satisfactionLevel: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="progress-notes" className="text-right">
                          Observações
                        </Label>
                        <Textarea
                          id="progress-notes"
                          value={newProgress.notes}
                          onChange={(e) => setNewProgress({ ...newProgress, notes: e.target.value })}
                          placeholder="Observações sobre o progresso..."
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddProgressOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddProgress}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={creatingProgress}
                      >
                        {creatingProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {progressLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : progress.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Peso</TableHead>
                        <TableHead>Calorias</TableHead>
                        <TableHead>Refeições</TableHead>
                        <TableHead>Energia</TableHead>
                        <TableHead>Fome</TableHead>
                        <TableHead>Satisfação</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {progress.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.date).toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell>{item.weight} kg</TableCell>
                          <TableCell>{item.caloriesConsumed} kcal</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>
                                {item.mealsCompleted}/{item.totalMeals}
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${item.completionPercentage}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.energyLevel >= 7
                                  ? "border-green-500 text-green-600"
                                  : item.energyLevel >= 4
                                    ? "border-yellow-500 text-yellow-600"
                                    : "border-red-500 text-red-600"
                              }
                            >
                              {item.energyLevel}/10
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.hungerLevel <= 3
                                  ? "border-green-500 text-green-600"
                                  : item.hungerLevel <= 6
                                    ? "border-yellow-500 text-yellow-600"
                                    : "border-red-500 text-red-600"
                              }
                            >
                              {item.hungerLevel}/10
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.satisfactionLevel >= 7
                                  ? "border-green-500 text-green-600"
                                  : item.satisfactionLevel >= 4
                                    ? "border-yellow-500 text-yellow-600"
                                    : "border-red-500 text-red-600"
                              }
                            >
                              {item.satisfactionLevel}/10
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{item.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-medium">Nenhum progresso registrado</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Adicione registros de progresso para acompanhar a evolução.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <FoodPickerModal
        open={isFoodPickerOpen}
        onOpenChange={setIsFoodPickerOpen}
        initial={newMeal.foods}
        onConfirm={(items) => setNewMeal({ ...newMeal, foods: items })}
      />
    </div>
  )
}
