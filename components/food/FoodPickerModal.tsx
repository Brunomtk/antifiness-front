"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useFoods } from "@/hooks/use-food"
import type { ApiFood } from "@/types/food"
import type { CreateMealFoodRequest } from "@/types/diet"
import { Plus, X } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (items: CreateMealFoodRequest[]) => void
  initial?: CreateMealFoodRequest[]
}

export default function FoodPickerModal({ open, onOpenChange, onConfirm, initial = [] }: Props) {
  const { foods, fetchFoods, loading } = useFoods()
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<CreateMealFoodRequest[]>(initial)

  React.useEffect(() => {
    if (open) {
      fetchFoods({ search: query })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const filtered = React.useMemo(() => {
    if (!query) return foods
    const q = query.toLowerCase()
    return foods.filter(f => f.name.toLowerCase().includes(q) || (f.categoryDescription?.toLowerCase().includes(q)))
  }, [foods, query])

  const addFood = (food: ApiFood) => {
    setSelected(prev => {
      if (prev.some(p => p.foodId === food.id)) return prev
      return [...prev, { foodId: food.id, quantity: 100, unit: "g" }]
    })
  }

  const removeFood = (id: number) => {
    setSelected(prev => prev.filter(p => p.foodId !== id))
  }

  const updateItem = (id: number, patch: Partial<CreateMealFoodRequest>) => {
    setSelected(prev => prev.map(p => (p.foodId === id ? { ...p, ...patch } : p)))
  }

  const handleConfirm = () => {
    onConfirm(selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Adicionar alimentos</DialogTitle>
          <DialogDescription>Pesquise e adicione alimentos à refeição</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchFoods({ search: query })
              }}
            />
            <div className="text-xs text-muted-foreground">{loading ? "Carregando..." : `${filtered.length} alimento(s)`}</div>
            <ScrollArea className="h-80 rounded border">
              <div className="p-2 space-y-2">
                {filtered.map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded border p-2">
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.categoryDescription}</div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => addFood(f)}>
                      <Plus className="mr-1 h-4 w-4" /> Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Selecionados</div>
            <ScrollArea className="h-96 rounded border">
              <div className="p-2 space-y-2">
                {selected.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4">Nenhum alimento selecionado.</div>
                ) : (
                  selected.map((it) => (
                    <div key={it.foodId} className="rounded border p-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">ID #{it.foodId}</div>
                        <Button size="icon" variant="ghost" onClick={() => removeFood(it.foodId)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Quantidade</div>
                          <Input type="number" value={it.quantity} onChange={(e) => updateItem(it.foodId, { quantity: Number(e.target.value) })} />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Unidade</div>
                          <Input value={it.unit} onChange={(e) => updateItem(it.foodId, { unit: e.target.value })} placeholder="g, ml, un" />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-end">por padrão 100 g</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
