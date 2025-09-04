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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Loader2, Apple, Beef, Wheat } from "lucide-react"
import { useFoods } from "@/hooks/use-food"
import {
  type ApiFood,
  type CreateFoodRequest,
  FoodCategory,
  getFoodCategoryLabel,
  getFoodCategoryColor,
} from "@/types/food"

export default function FoodsPage() {
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
  }, [fetchFoods])

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alimentos</h1>
          <p className="text-muted-foreground">Gerencie o banco de dados de alimentos</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alimentos</CardTitle>
          <CardDescription>Visualize e gerencie todos os alimentos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alimentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : foods.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alimento</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Calorias/100g</TableHead>
                    <TableHead>Proteínas</TableHead>
                    <TableHead>Carboidratos</TableHead>
                    <TableHead>Gorduras</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foods.map((food) => (
                    <TableRow key={food.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(food.category)}
                          <div>
                            <div className="font-medium">{food.name}</div>
                            {food.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {food.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getFoodCategoryColor(food.category)}>
                          {getFoodCategoryLabel(food.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{food.caloriesPer100g} kcal</TableCell>
                      <TableCell>{food.proteinPer100g}g</TableCell>
                      <TableCell>{food.carbsPer100g}g</TableCell>
                      <TableCell>{food.fatPer100g}g</TableCell>
                      <TableCell>
                        <Badge variant={food.isActive ? "default" : "secondary"}>
                          {food.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(food)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteFood(food.id)}
                              className="text-red-600"
                              disabled={deleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">Nenhum alimento encontrado</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Comece adicionando seu primeiro alimento."}
              </p>
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
