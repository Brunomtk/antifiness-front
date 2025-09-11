"use client"

import * as React from "react"
import { exerciseService } from "@/services/exercise-service"
import { useCompanies } from "@/hooks/use-companies"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Plus, Search, Edit, Trash2, Loader2, Dumbbell, ArrowLeft, Filter, Target, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Exercise } from "@/types/exercise"

export default function ExercisesPage() {
  const router = useRouter()
  const { companies, fetchCompanies } = useCompanies()

  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<Exercise[]>([])
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Exercise | null>(null)

  const [form, setForm] = React.useState<any>({
    name: "",
    description: "",
    instructions: "",
    muscleGroups: "",
    equipment: "",
    difficulty: 1,
    category: 1,
    tips: "",
    variations: "",
    mediaUrls: "",
    isActive: true,
    empresaId: undefined,
  })

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await exerciseService.getPaged({ page, pageSize: 10, search })
      setItems(res.exercises || [])
      setTotalPages(res.totalPages || 1)
    } catch (err: any) {
      toast({ title: "Erro ao carregar exercícios", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetch()
    fetchCompanies()
  }, [page, search, fetchCompanies])

  const onEdit = (ex: Exercise | null) => {
    setEditing(ex)
    setForm(
      ex
        ? {
            ...ex,
            muscleGroups: (ex.muscleGroups || []).join(", "),
            equipment: (ex.equipment || []).join(", "),
            mediaUrls: (ex.mediaUrls || []).join(", "),
          }
        : {
            name: "",
            description: "",
            instructions: "",
            muscleGroups: "",
            equipment: "",
            difficulty: 1,
            category: 1,
            tips: "",
            variations: "",
            mediaUrls: "",
            isActive: true,
            empresaId: undefined,
          },
    )
    setOpen(true)
  }

  const onDelete = async (ex: Exercise) => {
    const ok = confirm(`Excluir exercício "${ex.name}"?`)
    if (!ok) return
    try {
      await exerciseService.remove(ex.id)
      toast({ title: "Exercício excluído" })
      fetch()
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: String(err?.response?.data || err?.message || err) })
    }
  }

  const save = async () => {
    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        instructions: form.instructions,
        muscleGroups: String(form.muscleGroups || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        equipment: String(form.equipment || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        difficulty: Number(form.difficulty || 0) || undefined,
        category: Number(form.category || 0) || undefined,
        tips: form.tips,
        variations: form.variations,
        mediaUrls: String(form.mediaUrls || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
        isActive: !!form.isActive,
        empresaId: form.empresaId ? Number(form.empresaId) : undefined,
      }
      if (!editing) {
        await exerciseService.create(payload)
        toast({ title: "Exercício criado" })
      } else {
        await exerciseService.update(editing.id, payload)
        toast({ title: "Exercício atualizado" })
      }
      setOpen(false)
      fetch()
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: String(err?.response?.data || err?.message || err) })
    }
  }

  const totalExercises = items.length
  const activeExercises = items.filter((ex) => ex.isActive).length
  const avgDifficulty =
    items.length > 0
      ? Math.round((items.reduce((sum, ex) => sum + (ex.difficulty || 1), 0) / items.length) * 10) / 10
      : 0
  const categoriesCount = new Set(items.map((ex) => ex.category)).size

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Iniciante"
      case 2:
        return "Intermediário"
      case 3:
        return "Avançado"
      default:
        return "N/A"
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "bg-green-100 text-green-800"
      case 2:
        return "bg-yellow-100 text-yellow-800"
      case 3:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Exercícios</h1>
                <p className="text-blue-100 mt-1">Gerencie o banco de dados de exercícios</p>
              </div>
            </div>
            <Button onClick={() => onEdit(null)} className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="mr-2 h-4 w-4" />
              Novo Exercício
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Exercícios</p>
                <p className="text-3xl font-bold text-blue-900">{totalExercises}</p>
                <p className="text-xs text-blue-500 mt-1">Cadastrados no sistema</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Exercícios Ativos</p>
                <p className="text-3xl font-bold text-green-900">{activeExercises}</p>
                <p className="text-xs text-green-500 mt-1">
                  {totalExercises > 0 ? Math.round((activeExercises / totalExercises) * 100) : 0}% do total
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Dificuldade Média</p>
                <p className="text-3xl font-bold text-orange-900">{avgDifficulty}</p>
                <p className="text-xs text-orange-500 mt-1">De 1 a 3</p>
              </div>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
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
              <CardTitle className="text-xl text-gray-900">Banco de Exercícios</CardTitle>
              <CardDescription className="text-gray-600">
                Visualize e gerencie todos os exercícios cadastrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar exercícios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : items.length > 0 ? (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">Exercício</TableHead>
                    <TableHead className="font-semibold text-gray-900">Músculos</TableHead>
                    <TableHead className="font-semibold text-gray-900">Equipamentos</TableHead>
                    <TableHead className="font-semibold text-gray-900">Dificuldade</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="w-[100px] font-semibold text-gray-900">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((exercise) => (
                    <TableRow key={exercise.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Dumbbell className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{exercise.name}</div>
                            {exercise.description && (
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">{exercise.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(exercise.muscleGroups || []).slice(0, 2).map((muscle, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {muscle}
                            </Badge>
                          ))}
                          {(exercise.muscleGroups || []).length > 2 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                              +{(exercise.muscleGroups || []).length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(exercise.equipment || []).slice(0, 2).map((equip, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-200"
                            >
                              {equip}
                            </Badge>
                          ))}
                          {(exercise.equipment || []).length > 2 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                              +{(exercise.equipment || []).length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(exercise.difficulty || 1)}>
                          {getDifficultyLabel(exercise.difficulty || 1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={exercise.isActive ? "default" : "secondary"}
                          className={exercise.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                        >
                          {exercise.isActive ? "Ativo" : "Inativo"}
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
                                  onClick={() => onEdit(exercise)}
                                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar exercício</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDelete(exercise)}
                                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Excluir exercício</TooltipContent>
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
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exercício encontrado</h3>
              <p className="text-sm text-gray-500 mb-4">
                {search ? "Tente ajustar os filtros de busca." : "Comece adicionando seu primeiro exercício."}
              </p>
              {!search && (
                <Button onClick={() => onEdit(null)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Exercício
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{editing ? "Editar exercício" : "Novo exercício"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Exercício</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))}
                placeholder="Ex: Supino reto"
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select
                value={form.empresaId ? String(form.empresaId) : ""}
                onValueChange={(value) => setForm((s: any) => ({ ...s, empresaId: value ? Number(value) : undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(companies) &&
                    companies.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))}
                placeholder="Descrição do exercício..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Instruções</Label>
              <Textarea
                rows={3}
                value={form.instructions}
                onChange={(e) => setForm((s: any) => ({ ...s, instructions: e.target.value }))}
                placeholder="Como executar o exercício..."
              />
            </div>
            <div className="space-y-2">
              <Label>Músculos (separados por vírgula)</Label>
              <Input
                value={form.muscleGroups}
                onChange={(e) => setForm((s: any) => ({ ...s, muscleGroups: e.target.value }))}
                placeholder="Ex: Peitoral, Tríceps, Deltoides"
              />
            </div>
            <div className="space-y-2">
              <Label>Equipamentos (separados por vírgula)</Label>
              <Input
                value={form.equipment}
                onChange={(e) => setForm((s: any) => ({ ...s, equipment: e.target.value }))}
                placeholder="Ex: Barra, Banco, Anilhas"
              />
            </div>
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select
                value={String(form.difficulty)}
                onValueChange={(value) => setForm((s: any) => ({ ...s, difficulty: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Iniciante</SelectItem>
                  <SelectItem value="2">Intermediário</SelectItem>
                  <SelectItem value="3">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={String(form.category)}
                onValueChange={(value) => setForm((s: any) => ({ ...s, category: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Força</SelectItem>
                  <SelectItem value="2">Hipertrofia</SelectItem>
                  <SelectItem value="3">Cardio</SelectItem>
                  <SelectItem value="4">Mobilidade</SelectItem>
                  <SelectItem value="5">Funcional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Dicas</Label>
              <Textarea
                rows={2}
                value={form.tips}
                onChange={(e) => setForm((s: any) => ({ ...s, tips: e.target.value }))}
                placeholder="Dicas importantes para execução..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Variações</Label>
              <Textarea
                rows={2}
                value={form.variations}
                onChange={(e) => setForm((s: any) => ({ ...s, variations: e.target.value }))}
                placeholder="Variações do exercício..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>URLs de Mídia (separadas por vírgula)</Label>
              <Input
                value={form.mediaUrls}
                onChange={(e) => setForm((s: any) => ({ ...s, mediaUrls: e.target.value }))}
                placeholder="URLs de vídeos ou imagens..."
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((s: any) => ({ ...s, isActive: checked }))}
              />
              <Label>Exercício ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">
              {editing ? "Salvar alterações" : "Criar exercício"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
