"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MessageSquare,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFeedback } from "@/contexts/feedback-context"
import {
  FeedbackType,
  FeedbackStatus,
  FeedbackTypeNames,
  FeedbackCategoryNames,
  FeedbackStatusNames,
} from "@/types/feedback"

export default function FeedbacksPage() {
  const router = useRouter()
  const { state, fetchFeedbacks, fetchFeedbackStats, deleteFeedback, setFilters } = useFeedback()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // Carregar dados iniciais
  useEffect(() => {
    fetchFeedbacks()
    fetchFeedbackStats()
  }, [fetchFeedbacks, fetchFeedbackStats])

  // Aplicar filtros
  const handleFilter = () => {
    const filters: any = {
      pageNumber: 1,
      pageSize: 10,
    }

    if (searchTerm) filters.search = searchTerm
    if (selectedType !== "all") filters.type = Number.parseInt(selectedType)
    if (selectedCategory !== "all") filters.category = Number.parseInt(selectedCategory)
    if (selectedStatus !== "all") filters.status = Number.parseInt(selectedStatus)

    setFilters(filters)
    fetchFeedbacks(filters)
  }

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedType("all")
    setSelectedCategory("all")
    setSelectedStatus("all")
    const filters = { pageNumber: 1, pageSize: 10 }
    setFilters(filters)
    fetchFeedbacks(filters)
  }

  // Navegar páginas
  const handlePageChange = (page: number) => {
    const filters = {
      ...state.filters,
      pageNumber: page,
    }
    setFilters(filters)
    fetchFeedbacks(filters)
  }

  // Deletar feedback
  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este feedback?")) {
      try {
        await deleteFeedback(id)
      } catch (error) {
        console.error("Erro ao deletar feedback:", error)
      }
    }
  }

  // Renderizar estrelas
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
      </div>
    )
  }

  // Renderizar badge de status
  const renderStatusBadge = (status: FeedbackStatus, statusName: string) => {
    const colors = {
      [FeedbackStatus.PENDING]: "bg-yellow-100 text-yellow-800",
      [FeedbackStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
      [FeedbackStatus.RESOLVED]: "bg-green-100 text-green-800",
      [FeedbackStatus.CLOSED]: "bg-gray-100 text-gray-800",
      [FeedbackStatus.ESCALATED]: "bg-red-100 text-red-800",
    }

    return <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>{statusName}</Badge>
  }

  // Renderizar badge de tipo
  const renderTypeBadge = (type: FeedbackType, typeName: string) => {
    const colors = {
      [FeedbackType.COMPLAINT]: "bg-red-100 text-red-800",
      [FeedbackType.SUGGESTION]: "bg-blue-100 text-blue-800",
      [FeedbackType.COMPLIMENT]: "bg-green-100 text-green-800",
      [FeedbackType.QUESTION]: "bg-purple-100 text-purple-800",
      [FeedbackType.BUG_REPORT]: "bg-orange-100 text-orange-800",
    }

    return <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>{typeName}</Badge>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedbacks</h1>
          <p className="text-muted-foreground">Gerencie todos os feedbacks dos clientes.</p>
        </div>
        <Button className="bg-[#df0e67] hover:bg-[#df0e67]/90" onClick={() => router.push("/admin/feedbacks/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Feedback
        </Button>
      </div>

      {/* Estatísticas */}
      {state.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.stats.totalFeedbacks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.stats.pendingFeedbacks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.stats.resolvedFeedbacks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.stats.averageRating.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(FeedbackTypeNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.entries(FeedbackCategoryNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(FeedbackStatusNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button onClick={handleFilter} className="flex-1">
                  Filtrar
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Feedbacks</CardTitle>
        </CardHeader>
        <CardContent>
          {state.loading.feedbacks ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#df0e67] mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando feedbacks...</p>
              </div>
            </div>
          ) : state.feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum feedback encontrado.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{feedback.isAnonymous ? "Anônimo" : feedback.clientName}</p>
                          <p className="text-sm text-muted-foreground">ID: {feedback.clientId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{feedback.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{feedback.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{renderTypeBadge(feedback.type, feedback.typeName)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{feedback.categoryName}</Badge>
                      </TableCell>
                      <TableCell>{renderStars(feedback.rating)}</TableCell>
                      <TableCell>{renderStatusBadge(feedback.status, feedback.statusName)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(feedback.createdDate).toLocaleDateString("pt-BR")}</p>
                          <p className="text-muted-foreground">
                            {new Date(feedback.createdDate).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/feedbacks/${feedback.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(feedback.id)}
                            disabled={state.loading.deleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {state.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(state.pagination.pageNumber - 1) * state.pagination.pageSize + 1} a{" "}
                    {Math.min(state.pagination.pageNumber * state.pagination.pageSize, state.pagination.totalCount)} de{" "}
                    {state.pagination.totalCount} resultados
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.pagination.pageNumber - 1)}
                      disabled={!state.pagination.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {state.pagination.pageNumber} de {state.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.pagination.pageNumber + 1)}
                      disabled={!state.pagination.hasNextPage}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mensagem de erro */}
      {state.error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Erro</AlertTitle>
          <AlertDescription className="text-red-700">{state.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
