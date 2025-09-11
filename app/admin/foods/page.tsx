"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Plus, Search, Edit, Trash2, Loader2, Apple, Beef, Wheat, ArrowLeft, Filter, Eye } from "lucide-react"
import { useFoods } from "@/hooks/use-food"
import { useCompanies } from "@/hooks/use-companies"
import {
  type ApiFood,
  type CreateFoodRequest,
  FoodCategory,
  getFoodCategoryLabel,
  getFoodCategoryColor,
} from "@/types/food"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function FoodsPage() {
  const router = useRouter()
  const {
    foods,
    loading,
    creating,
    updating,
    deleting,
    fetchFoods,
    createFood,
    updateFood,
    deleteFood,
    searchFoods,
    getFoodsByCategory,
  } = useFoods()

  const { companies, fetchCompanies } = useCompanies()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<ApiFood | null>(null)

  const [newFood, setNewFood] = useState<CreateFoodRequest>({
    name: "",
    description: "",
    category: FoodCategory.OTHERS,
    caloriesPer100g: 0,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatPer100g: 0,
    fiberPer100g: 0,
    sodiumPer100g: 0,
    allergens: "",
    commonPortions: JSON.stringify([{ name: "Porção padrão", grams: 100 }]),
    isActive: true,
  })

  // Carregar alimentos ao montar o componente
  useEffect(() => {
    fetchFoods()
    fetchCompanies()
  }, [fetchFoods, fetchCompanies])

  // Buscar alimentos quando o filtro mudar
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        const category = selectedCategory === "all" ? undefined : Number(selectedCategory)
        searchFoods(searchQuery, category)
      } else if (selectedCategory !== "all") {
        getFoodsByCategory(Number(selectedCategory))
      } else {
        fetchFoods()
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, selectedCategory, searchFoods, getFoodsByCategory, fetchFoods])

  const handleCreateFood = async () => {
    try {
      await createFood(newFood)
      setNewFood({
        name: "",
        description: "",
        category: FoodCategory.OTHERS,
        caloriesPer100g: 0,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 0,
        fiberPer100g: 0,
        sodiumPer100g: 0,
        allergens: "",
        commonPortions: JSON.stringify([{ name: "Porção padrão", grams: 100 }]),
        isActive: true,
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Erro ao criar alimento:", error)
    }
  }

  const handleEditFood = async () => {
    if (!selectedFood) return

    try {
      await updateFood(selectedFood.id, {
        name: selectedFood.name,
        description: selectedFood.description,
        category: selectedFood.category,
        caloriesPer100g: selectedFood.caloriesPer100g,
        proteinPer100g: selectedFood.proteinPer100g,
        carbsPer100g: selectedFood.carbsPer100g,
        fatPer100g: selectedFood.fatPer100g,
        fiberPer100g: selectedFood.fiberPer100g,
        sodiumPer100g: selectedFood.sodiumPer100g,
        allergens: selectedFood.allergens,
        commonPortions: selectedFood.commonPortions,
        isActive: selectedFood.isActive,
      })
      setIsEditDialogOpen(false)
      setSelectedFood(null)
    } catch (error) {
      console.error("Erro ao atualizar alimento:", error)
    }
  }

  const handleDeleteFood = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este alimento?")) {
      try {
        await deleteFood(id)
      } catch (error) {
        console.error("Erro ao excluir alimento:", error)
      }
    }
  }

  const openEditDialog = (food: ApiFood) => {
    setSelectedFood(food)
    setIsEditDialogOpen(true)
  }

  const getCategoryIcon = (category: FoodCategory) => {
    switch (category) {
      case FoodCategory.PROTEINS:
        return <Beef className="h-4 w-4" />
      case FoodCategory.CARBS:
        return <Wheat className="h-4 w-4" />
      case FoodCategory.FRUITS:
        return <Apple className="h-4 w-4" />
      default:
        return <Apple className="h-4 w-4" />
    }
  }

  const totalFoods = foods.length
  const activeFoods = foods.filter((f) => f.isActive).length
  const avgCalories =
    foods.length > 0 ? Math.round(foods.reduce((sum, f) => sum + f.caloriesPer100g, 0) / foods.length) : 0
  const categoriesCount = new Set(foods.map((f) => f.category)).size

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Alimentos</h1>
                <p className="text-green-100 mt-1">Gerencie o banco de dados de alimentos</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-green-600 hover:bg-green-50">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Alimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Alimento</DialogTitle>
                  <DialogDescription>Adicione um novo alimento ao banco de dados.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="food-name">Nome do Alimento</Label>
                      <Input
                        id="food-name"
                        value={newFood.name}
                        onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                        placeholder="Ex: Peito de frango"
                      />
                    </div>
                    <div>
                      <Label htmlFor="food-category">Categoria</Label>
                      <Select
                        value={newFood.category.toString()}
                        onValueChange={(value) => setNewFood({ ...newFood, category: Number(value) as FoodCategory })}
                      >
                        <SelectTrigger id="food-category">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Proteínas</SelectItem>
                          <SelectItem value="1">Carboidratos</SelectItem>
                          <SelectItem value="2">Vegetais</SelectItem>
                          <SelectItem value="3">Frutas</SelectItem>
                          <SelectItem value="4">Laticínios</SelectItem>
                          <SelectItem value="5">Gorduras</SelectItem>
                          <SelectItem value="6">Bebidas</SelectItem>
                          <SelectItem value="7">Suplementos</SelectItem>
                          <SelectItem value="8">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="food-description">Descrição</Label>
                    <Textarea
                      id="food-description"
                      value={newFood.description}
                      onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                      placeholder="Descrição do alimento..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="food-calories">Calorias (por 100g)</Label>
                      <Input
                        id="food-calories"
                        type="number"
                        value={newFood.caloriesPer100g}
                        onChange={(e) => setNewFood({ ...newFood, caloriesPer100g: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="food-protein">Proteínas (g)</Label>
                      <Input
                        id="food-protein"
                        type="number"
                        step="0.1"
                        value={newFood.proteinPer100g}
                        onChange={(e) => setNewFood({ ...newFood, proteinPer100g: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="food-carbs">Carboidratos (g)</Label>
                      <Input
                        id="food-carbs"
                        type="number"
                        step="0.1"
                        value={newFood.carbsPer100g}
                        onChange={(e) => setNewFood({ ...newFood, carbsPer100g: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="food-fat">Gorduras (g)</Label>
                      <Input
                        id="food-fat"
                        type="number"
                        step="0.1"
                        value={newFood.fatPer100g}
                        onChange={(e) => setNewFood({ ...newFood, fatPer100g: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="food-fiber">Fibras (g)</Label>
                      <Input
                        id="food-fiber"
                        type="number"
                        step="0.1"
                        value={newFood.fiberPer100g}
                        onChange={(e) => setNewFood({ ...newFood, fiberPer100g: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="food-sodium">Sódio (mg)</Label>
                      <Input
                        id="food-sodium"
                        type="number"
                        value={newFood.sodiumPer100g}
                        onChange={(e) => setNewFood({ ...newFood, sodiumPer100g: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="food-allergens">Alérgenos</Label>
                    <Input
                      id="food-allergens"
                      value={newFood.allergens}
                      onChange={(e) => setNewFood({ ...newFood, allergens: e.target.value })}
                      placeholder="Ex: Glúten, Lactose, Soja"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="food-active"
                      checked={newFood.isActive}
                      onCheckedChange={(checked) => setNewFood({ ...newFood, isActive: checked })}
                    />
                    <Label htmlFor="food-active">Alimento ativo</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateFood} className="bg-green-600 hover:bg-green-700" disabled={creating}>
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Criar Alimento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Alimentos</p>
                <p className="text-3xl font-bold text-blue-900">{totalFoods}</p>
                <p className="text-xs text-blue-500 mt-1">Cadastrados no sistema</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Apple className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Alimentos Ativos</p>
                <p className="text-3xl font-bold text-green-900">{activeFoods}</p>
                <p className="text-xs text-green-500 mt-1">
                  {totalFoods > 0 ? Math.round((activeFoods / totalFoods) * 100) : 0}% do total
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Beef className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Calorias Médias</p>
                <p className="text-3xl font-bold text-orange-900">{avgCalories}</p>
                <p className="text-xs text-orange-500 mt-1">kcal por 100g</p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Wheat className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Categorias</p>
                <p className="text-3xl font-bold text-purple-900">{categoriesCount}</p>
                <p className="text-xs text-purple-500 mt-1">Diferentes tipos</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Filter className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-gray-900">Banco de Alimentos</CardTitle>
              <CardDescription className="text-gray-600">
                Visualize e gerencie todos os alimentos cadastrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar alimentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] border-gray-200">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="0">Proteínas</SelectItem>
                  <SelectItem value="1">Carboidratos</SelectItem>
                  <SelectItem value="2">Vegetais</SelectItem>
                  <SelectItem value="3">Frutas</SelectItem>
                  <SelectItem value="4">Laticínios</SelectItem>
                  <SelectItem value="5">Gorduras</SelectItem>
                  <SelectItem value="6">Bebidas</SelectItem>
                  <SelectItem value="7">Suplementos</SelectItem>
                  <SelectItem value="8">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : foods.length > 0 ? (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">Alimento</TableHead>
                    <TableHead className="font-semibold text-gray-900">Categoria</TableHead>
                    <TableHead className="font-semibold text-gray-900">Calorias/100g</TableHead>
                    <TableHead className="font-semibold text-gray-900">Proteínas</TableHead>
                    <TableHead className="font-semibold text-gray-900">Carboidratos</TableHead>
                    <TableHead className="font-semibold text-gray-900">Gorduras</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="w-[100px] font-semibold text-gray-900">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foods.map((food) => (
                    <TableRow key={food.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            {getCategoryIcon(food.category)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{food.name}</div>
                            {food.description && (
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">{food.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getFoodCategoryColor(food.category)} border-0`}>
                          {getFoodCategoryLabel(food.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{food.caloriesPer100g} kcal</TableCell>
                      <TableCell className="text-gray-700">{food.proteinPer100g}g</TableCell>
                      <TableCell className="text-gray-700">{food.carbsPer100g}g</TableCell>
                      <TableCell className="text-gray-700">{food.fatPer100g}g</TableCell>
                      <TableCell>
                        <Badge
                          variant={food.isActive ? "default" : "secondary"}
                          className={food.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                        >
                          {food.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalhes</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(food)}
                                  className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar alimento</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFood(food.id)}
                                  disabled={deleting}
                                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Excluir alimento</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alimento encontrado</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery || selectedCategory !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Comece adicionando seu primeiro alimento."}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Alimento
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Alimento</DialogTitle>
            <DialogDescription>Atualize as informações do alimento.</DialogDescription>
          </DialogHeader>
          {selectedFood && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-food-name">Nome do Alimento</Label>
                  <Input
                    id="edit-food-name"
                    value={selectedFood.name}
                    onChange={(e) => setSelectedFood({ ...selectedFood, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-food-category">Categoria</Label>
                  <Select
                    value={selectedFood.category.toString()}
                    onValueChange={(value) =>
                      setSelectedFood({ ...selectedFood, category: Number(value) as FoodCategory })
                    }
                  >
                    <SelectTrigger id="edit-food-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Proteínas</SelectItem>
                      <SelectItem value="1">Carboidratos</SelectItem>
                      <SelectItem value="2">Vegetais</SelectItem>
                      <SelectItem value="3">Frutas</SelectItem>
                      <SelectItem value="4">Laticínios</SelectItem>
                      <SelectItem value="5">Gorduras</SelectItem>
                      <SelectItem value="6">Bebidas</SelectItem>
                      <SelectItem value="7">Suplementos</SelectItem>
                      <SelectItem value="8">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-food-description">Descrição</Label>
                <Textarea
                  id="edit-food-description"
                  value={selectedFood.description}
                  onChange={(e) => setSelectedFood({ ...selectedFood, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-food-calories">Calorias (por 100g)</Label>
                  <Input
                    id="edit-food-calories"
                    type="number"
                    value={selectedFood.caloriesPer100g}
                    onChange={(e) => setSelectedFood({ ...selectedFood, caloriesPer100g: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-food-protein">Proteínas (g)</Label>
                  <Input
                    id="edit-food-protein"
                    type="number"
                    step="0.1"
                    value={selectedFood.proteinPer100g}
                    onChange={(e) => setSelectedFood({ ...selectedFood, proteinPer100g: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-food-carbs">Carboidratos (g)</Label>
                  <Input
                    id="edit-food-carbs"
                    type="number"
                    step="0.1"
                    value={selectedFood.carbsPer100g}
                    onChange={(e) => setSelectedFood({ ...selectedFood, carbsPer100g: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-food-fat">Gorduras (g)</Label>
                  <Input
                    id="edit-food-fat"
                    type="number"
                    step="0.1"
                    value={selectedFood.fatPer100g}
                    onChange={(e) => setSelectedFood({ ...selectedFood, fatPer100g: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-food-fiber">Fibras (g)</Label>
                  <Input
                    id="edit-food-fiber"
                    type="number"
                    step="0.1"
                    value={selectedFood.fiberPer100g}
                    onChange={(e) => setSelectedFood({ ...selectedFood, fiberPer100g: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-food-sodium">Sódio (mg)</Label>
                  <Input
                    id="edit-food-sodium"
                    type="number"
                    value={selectedFood.sodiumPer100g}
                    onChange={(e) => setSelectedFood({ ...selectedFood, sodiumPer100g: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-food-allergens">Alérgenos</Label>
                <Input
                  id="edit-food-allergens"
                  value={selectedFood.allergens}
                  onChange={(e) => setSelectedFood({ ...selectedFood, allergens: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-food-active"
                  checked={selectedFood.isActive}
                  onCheckedChange={(checked) => setSelectedFood({ ...selectedFood, isActive: checked })}
                />
                <Label htmlFor="edit-food-active">Alimento ativo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditFood} className="bg-green-600 hover:bg-green-700" disabled={updating}>
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
