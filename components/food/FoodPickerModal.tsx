"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useFoods } from "@/hooks/use-food"
import { foodService } from "@/services/food-service"
import type { ApiFood } from "@/types/food"
import type { CreateMealFoodRequest } from "@/types/diet"
import { Plus, X, Search, Utensils, Zap, Activity } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (items: CreateMealFoodRequest[]) => void
  initial?: CreateMealFoodRequest[]
}

export default function FoodPickerModal({ open, onOpenChange, onConfirm, initial = [] }: Props) {
  const { foods, fetchFoods, loading } = useFoods()
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<CreateMealFoodRequest[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (open) {
      console.log("[v0] FoodPickerModal opened with initial foods:", initial)
      console.log("[v0] Initial foods count:", initial.length)

      // Always reset to exactly the initial foods provided - create deep copy
      const initialCopy = initial.map((food) => ({
        foodId: food.foodId,
        quantity: food.quantity,
        unit: food.unit,
      }))

      console.log("[v0] Setting selected foods to:", initialCopy)
      setSelected(initialCopy)
      setQuery("") // Reset search
      setSelectedCategory(null) // Reset category filter
      fetchFoods()
    }
  }, [open, fetchFoods])

  React.useEffect(() => {
    if (open && initial) {
      console.log("[v0] Initial foods updated while modal open:", initial)
      const initialCopy = initial.map((food) => ({
        foodId: food.foodId,
        quantity: food.quantity,
        unit: food.unit,
      }))
      console.log("[v0] Updating selected foods to match initial:", initialCopy)
      setSelected(initialCopy)
    }
  }, [initial, open])

  const categoryOptions = foodService.getFoodCategoryOptions()

  const filtered = React.useMemo(() => {
    let result = foods

    if (selectedCategory !== null) {
      result = result.filter((f) => f.category === selectedCategory)
    }

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.categoryDescription?.toLowerCase().includes(q),
      )
    }

    return result
  }, [foods, query, selectedCategory])

  const selectedFoodsWithDetails = React.useMemo(() => {
    return selected.map((item) => {
      const food = foods.find((f) => f.id === item.foodId)
      return { ...item, food }
    })
  }, [selected, foods])

  const addFood = (food: ApiFood) => {
    setSelected((prev) => {
      if (prev.some((p) => p.foodId === food.id)) return prev
      return [...prev, { foodId: food.id, quantity: 100, unit: "g" }]
    })
  }

  const removeFood = (id: number) => {
    setSelected((prev) => prev.filter((p) => p.foodId !== id))
  }

  const updateItem = (id: number, patch: Partial<CreateMealFoodRequest>) => {
    setSelected((prev) => prev.map((p) => (p.foodId === id ? { ...p, ...patch } : p)))
  }

  const handleConfirm = () => {
    console.log("[v0] FoodPickerModal confirming selection")
    console.log("[v0] Selected foods before confirmation:", selected)
    console.log("[v0] Number of selected foods:", selected.length)

    const cleanSelected = selected.map((food) => ({
      foodId: food.foodId,
      quantity: food.quantity,
      unit: food.unit,
    }))

    console.log("[v0] Clean selected foods for confirmation:", cleanSelected)
    onConfirm(cleanSelected)
    onOpenChange(false)
  }

  const getCategoryInfo = (categoryId: number) => {
    return categoryOptions.find((cat) => cat.value === categoryId) || categoryOptions[6] // Default to "Outros"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Selecionar Alimentos
          </DialogTitle>
          <DialogDescription>Escolha os alimentos para esta refeição</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimentos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todas
              </Button>
              {categoryOptions.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="gap-1"
                >
                  <span>{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Foods list */}
            <div className="text-xs text-muted-foreground">
              {loading ? "Carregando..." : `${filtered.length} alimento(s) encontrado(s)`}
            </div>

            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((food) => {
                  const categoryInfo = getCategoryInfo(food.category)
                  const isSelected = selected.some((s) => s.foodId === food.id)

                  return (
                    <Card
                      key={food.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">{food.name}</h4>
                            <Badge variant="secondary" className={`text-xs ${categoryInfo.color}`}>
                              {categoryInfo.icon} {food.categoryDescription}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant={isSelected ? "secondary" : "default"}
                            onClick={() => (isSelected ? removeFood(food.id) : addFood(food))}
                            disabled={isSelected}
                          >
                            {isSelected ? (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Adicionado
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Adicionar
                              </>
                            )}
                          </Button>
                        </div>

                        {food.description && <p className="text-xs text-muted-foreground mb-2">{food.description}</p>}

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            <span>{food.caloriesPer100g} kcal</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-red-500" />
                            <span>{food.proteinPer100g}g prot</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>{food.carbsPer100g}g carb</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Selecionados</h3>
              <Badge variant="outline">{selected.length} item(s)</Badge>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {selectedFoodsWithDetails.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum alimento selecionado</p>
                  </div>
                ) : (
                  selectedFoodsWithDetails.map((item) => {
                    const categoryInfo = item.food ? getCategoryInfo(item.food.category) : null

                    return (
                      <Card key={item.foodId}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.food?.name || `Alimento #${item.foodId}`}</h4>
                              {categoryInfo && (
                                <Badge variant="secondary" className={`text-xs ${categoryInfo.color}`}>
                                  {categoryInfo.icon} {item.food?.categoryDescription}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Quantidade</label>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.foodId, { quantity: Number(e.target.value) })}
                                className="h-8 text-sm"
                                min="0"
                                step="0.1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Unidade</label>
                              <Input
                                value={item.unit}
                                onChange={(e) => updateItem(item.foodId, { unit: e.target.value })}
                                placeholder="g, ml, un"
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>

                          {item.food && (
                            <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                              <div>{Math.round((item.food.caloriesPer100g * item.quantity) / 100)} kcal</div>
                              <div>{Math.round((item.food.proteinPer100g * item.quantity) / 100)}g prot</div>
                              <div>{Math.round((item.food.carbsPer100g * item.quantity) / 100)}g carb</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={selected.length === 0}>
            Confirmar ({selected.length} item{selected.length !== 1 ? "s" : ""})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
