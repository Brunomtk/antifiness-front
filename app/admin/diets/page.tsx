"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, FileText, Copy, Calendar, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { useDiets, useDietStats } from "@/hooks/use-diet"
import { useClients } from "@/hooks/use-client"
import { DietStatus, getDietStatusLabel, getDietStatusColor } from "@/types/diet"
import { toast } from "sonner"

export default function DietsPage() {
  const {
    diets,
    loading,
    creating,
    updating,
    deleting,
    error,
    pagination,
    fetchDiets,
    createDiet,
    updateDiet,
    deleteDiet,
  } = useDiets()

  const { stats, fetchStats } = useDietStats()
  const { clients, fetchClients } = useClients()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<DietStatus | "all">("all")
  const [clientFilter, setClientFilter] = useState<string>("all")
  const [isAddDietOpen, setIsAddDietOpen] = useState(false)
  const [isEditDietOpen, setIsEditDietOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [editingDiet, setEditingDiet] = useState<any>(null)
  const [dietToDelete, setDietToDelete] = useState<number | null>(null)

  // Nova dieta
  const [newDiet, setNewDiet] = useState({
    name: "",
    description: "",
    clientId: 0,
    startDate: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
    endDate: "",
    status: DietStatus.DRAFT,
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 200,
    dailyFat: 70,
    dailyFiber: 25,
    dailySodium: 2300,
    restrictions: "",
    notes: "",
  })

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchDiets()
    fetchClients()
    fetchStats()
  }, [fetchDiets, fetchClients, fetchStats])

  // Filtrar dietas
  const filteredDiets = diets.filter((diet) => {
    const matchesSearch =
      diet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diet.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || diet.status === statusFilter
    const matchesClient = clientFilter === "all" || diet.clientId.toString() === clientFilter

    return matchesSearch && matchesStatus && matchesClient
  })

  // Adicionar dieta
  const handleAddDiet = async () => {
    if (!newDiet.name || !newDiet.clientId) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    try {
      await createDiet(newDiet)
      setNewDiet({
        name: "",
        description: "",
        clientId: 0,
        startDate: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
        endDate: "",
        status: DietStatus.DRAFT,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyCarbs: 200,
        dailyFat: 70,
        dailyFiber: 25,
        dailySodium: 2300,
        restrictions: "",
        notes: "",
      })
      setIsAddDietOpen(false)
    } catch (error) {
      // Error já tratado no hook
    }
  }

  // Editar dieta
  const handleEditDiet = (dietId: number) => {
    const diet = diets.find((d) => d.id === dietId)
    if (diet) {
      setEditingDiet({ ...diet })
      setIsEditDietOpen(true)
    }
  }

  // Salvar dieta editada
  const handleSaveEditedDiet = async () => {
    if (editingDiet) {
      try {
        await updateDiet(editingDiet.id, {
          name: editingDiet.name,
          description: editingDiet.description,
          clientId: editingDiet.clientId,
          startDate: editingDiet.startDate,
          endDate: editingDiet.endDate,
          status: editingDiet.status,
          dailyCalories: editingDiet.dailyCalories,
          dailyProtein: editingDiet.dailyProtein,
          dailyCarbs: editingDiet.dailyCarbs,
          dailyFat: editingDiet.dailyFat,
          dailyFiber: editingDiet.dailyFiber,
          dailySodium: editingDiet.dailySodium,
          restrictions: editingDiet.restrictions,
          notes: editingDiet.notes,
        })
        setIsEditDietOpen(false)
        setEditingDiet(null)
      } catch (error) {
        // Error já tratado no hook
      }
    }
  }

  // Excluir dieta
  const handleDeleteDiet = async () => {
    if (dietToDelete) {
      try {
        await deleteDiet(dietToDelete)
        setDietToDelete(null)
        setIsDeleteDialogOpen(false)
      } catch (error) {
        // Error já tratado no hook
      }
    }
  }

  // Duplicar dieta
  const handleDuplicateDiet = async (dietId: number) => {
    const dietToDuplicate = diets.find((diet) => diet.id === dietId)
    if (dietToDuplicate) {
      try {
        await createDiet({
          name: `${dietToDuplicate.name} (Cópia)`,
          description: dietToDuplicate.description,
          clientId: dietToDuplicate.clientId,
          startDate: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
          endDate: dietToDuplicate.endDate,
          status: DietStatus.DRAFT,
          dailyCalories: dietToDuplicate.dailyCalories,
          dailyProtein: dietToDuplicate.dailyProtein,
          dailyCarbs: dietToDuplicate.dailyCarbs,
          dailyFat: dietToDuplicate.dailyFat,
          dailyFiber: dietToDuplicate.dailyFiber,
          dailySodium: dietToDuplicate.dailySodium,
          restrictions: dietToDuplicate.restrictions,
          notes: dietToDuplicate.notes,
        })
        toast.success("Dieta duplicada com sucesso!")
      } catch (error) {
        // Error já tratado no hook
      }
    }
  }

  if (loading && diets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dietas</h1>
          <p className="text-muted-foreground">Gerencie os planos alimentares para seus clientes</p>
        </div>

        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddDietOpen(true)} disabled={creating}>
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Nova Dieta
        </Button>
      </div>

      {/* Cards de estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Dietas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDiets}</div>
              <p className="text-xs text-muted-foreground">+{stats.dietsThisMonth} este mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dietas Ativas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeDiets}</div>
              <p className="text-xs text-muted-foreground">{stats.activeDietsPercentage.toFixed(1)}% do total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.averageCompletionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Média de adesão</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calorias Médias</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.averageCaloriesPerDiet}</div>
              <p className="text-xs text-muted-foreground">kcal por dieta</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Planos Alimentares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar dietas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button variant="outline" size="icon" onClick={() => setIsFilterOpen(true)}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Calorias</TableHead>
                  <TableHead className="hidden md:table-cell">Refeições</TableHead>
                  <TableHead className="hidden md:table-cell">Progresso</TableHead>
                  <TableHead className="hidden md:table-cell">Data Início</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredDiets.length > 0 ? (
                  filteredDiets.map((diet) => (
                    <TableRow key={diet.id}>
                      <TableCell>
                        <div className="font-medium">{diet.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {diet.dailyCalories} kcal | {diet.totalMeals} refeições
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{diet.clientName || "Cliente não encontrado"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getDietStatusColor(diet.status)}>
                          {getDietStatusLabel(diet.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{diet.dailyCalories} kcal</TableCell>
                      <TableCell className="hidden md:table-cell">{diet.totalMeals}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${diet.completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs">{diet.completionPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(diet.startDate).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/diets/${diet.id}`} className="cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditDiet(diet.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar Dieta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateDiet(diet.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar Dieta
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                setDietToDelete(diet.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir Dieta
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhuma dieta encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(pagination.pageNumber - 1) * pagination.pageSize + 1} a{" "}
                {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)} de{" "}
                {pagination.totalCount} dietas
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDiets({ pageNumber: pagination.pageNumber - 1 })}
                  disabled={!pagination.hasPreviousPage || loading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDiets({ pageNumber: pagination.pageNumber + 1 })}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de adicionar dieta */}
      <Dialog open={isAddDietOpen} onOpenChange={setIsAddDietOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Dieta</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo plano alimentar. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome *
              </Label>
              <Input
                id="name"
                value={newDiet.name}
                onChange={(e) => setNewDiet({ ...newDiet, name: e.target.value })}
                className="col-span-3"
                placeholder="Nome da dieta"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Cliente *
              </Label>
              <Select
                value={newDiet.clientId.toString()}
                onValueChange={(value) => { const id = Number(value); const c = clients.find(c=>c.id===id); setNewDiet({ ...newDiet, clientId: id, clientName: c?.name || "" }) }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newDiet.status.toString()}
                onValueChange={(value) => setNewDiet({ ...newDiet, status: Number(value) as DietStatus })}
              >
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newDiet.startDate.split("T")[0]}
                  onChange={(e) => setNewDiet({ ...newDiet, startDate: e.target.value + "T00:00:00.000Z" })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newDiet.endDate ? newDiet.endDate.split("T")[0] : ""}
                  onChange={(e) =>
                    setNewDiet({ ...newDiet, endDate: e.target.value ? e.target.value + "T00:00:00.000Z" : "" })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={newDiet.description}
                onChange={(e) => setNewDiet({ ...newDiet, description: e.target.value })}
                className="col-span-3"
                rows={3}
                placeholder="Descrição da dieta"
              />
            </div>

            {/* Macronutrientes */}
            <div className="space-y-4">
              <h4 className="font-medium">Macronutrientes Diários</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calorias (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={newDiet.dailyCalories}
                    onChange={(e) => setNewDiet({ ...newDiet, dailyCalories: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Proteínas (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={newDiet.dailyProtein}
                    onChange={(e) => setNewDiet({ ...newDiet, dailyProtein: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carboidratos (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={newDiet.dailyCarbs}
                    onChange={(e) => setNewDiet({ ...newDiet, dailyCarbs: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Gorduras (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={newDiet.dailyFat}
                    onChange={(e) => setNewDiet({ ...newDiet, dailyFat: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fiber">Fibras (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    value={newDiet.dailyFiber}
                    onChange={(e) => setNewDiet({ ...newDiet, dailyFiber: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="sodium">Sódio (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    value={newDiet.dailySodium}
                    onChange={(e) => setNewDiet({ ...newDiet, dailySodium: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="restrictions" className="text-right">
                Restrições
              </Label>
              <Textarea
                id="restrictions"
                value={newDiet.restrictions}
                onChange={(e) => setNewDiet({ ...newDiet, restrictions: e.target.value })}
                className="col-span-3"
                rows={2}
                placeholder="Restrições alimentares"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={newDiet.notes}
                onChange={(e) => setNewDiet({ ...newDiet, notes: e.target.value })}
                className="col-span-3"
                rows={2}
                placeholder="Observações gerais"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDietOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDiet} className="bg-green-600 hover:bg-green-700" disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Dieta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edição de dieta */}
      <Dialog open={isEditDietOpen} onOpenChange={setIsEditDietOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Dieta</DialogTitle>
            <DialogDescription>Edite os dados do plano alimentar. Clique em salvar quando terminar.</DialogDescription>
          </DialogHeader>
          {editingDiet && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-name"
                  value={editingDiet.name}
                  onChange={(e) => setEditingDiet({ ...editingDiet, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingDiet.status.toString()}
                  onValueChange={(value) => setEditingDiet({ ...editingDiet, status: Number(value) as DietStatus })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-calories" className="text-right">
                  Calorias Diárias
                </Label>
                <Input
                  id="edit-calories"
                  type="number"
                  value={editingDiet.dailyCalories}
                  onChange={(e) => setEditingDiet({ ...editingDiet, dailyCalories: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingDiet.description}
                  onChange={(e) => setEditingDiet({ ...editingDiet, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDietOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditedDiet} className="bg-green-600 hover:bg-green-700" disabled={updating}>
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de filtros */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtrar Dietas</DialogTitle>
            <DialogDescription>Selecione os filtros desejados para a lista de dietas.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status-filter" className="text-right">
                Status
              </Label>
              <Select value={statusFilter.toString()} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="0">Rascunho</SelectItem>
                  <SelectItem value="1">Ativa</SelectItem>
                  <SelectItem value="2">Pausada</SelectItem>
                  <SelectItem value="3">Concluída</SelectItem>
                  <SelectItem value="4">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client-filter" className="text-right">
                Cliente
              </Label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter("all")
                setClientFilter("all")
              }}
            >
              Limpar Filtros
            </Button>
            <Button onClick={() => setIsFilterOpen(false)} className="bg-green-600 hover:bg-green-700">
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta dieta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteDiet} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
