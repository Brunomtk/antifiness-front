"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MessageSquare,
  Plus,
  Star,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  MessageCircle,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useClientFeedback } from "@/hooks/use-client-feedback"
import {
  FeedbackType,
  FeedbackCategory,
  FeedbackStatus,
  getFeedbackTypeLabel,
  getFeedbackCategoryLabel,
  getFeedbackStatusLabel,
  type Feedback,
} from "@/types/feedback"
import NotificationDropdown from "@/components/notification-dropdown"

export default function ClientFeedbacks() {
  const isMobile = useMobile()
  const { feedbacks, loading, error, createFeedback, clearError, refreshFeedbacks } = useClientFeedback()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "answered">("all")

  // Form state com inicialização adequada
  const [formData, setFormData] = useState({
    type: FeedbackType.SUGGESTION,
    category: FeedbackCategory.APP,
    title: "",
    description: "",
    rating: 5,
    isAnonymous: false,
  })

  const handleCreateFeedback = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return
    }

    const success = await createFeedback(formData)

    if (success) {
      setFormData({
        type: FeedbackType.SUGGESTION,
        category: FeedbackCategory.APP,
        title: "",
        description: "",
        rating: 5,
        isAnonymous: false,
      })
      setIsCreateOpen(false)
    }
  }

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setIsDetailsOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case FeedbackStatus.PENDING:
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case FeedbackStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700 border-blue-200"
      case FeedbackStatus.RESOLVED:
        return "bg-green-100 text-green-700 border-green-200"
      case FeedbackStatus.CLOSED:
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (filter === "pending") return feedback.status === FeedbackStatus.PENDING
    if (filter === "answered") return feedback.status === FeedbackStatus.RESOLVED
    return true
  })

  if (loading.feedbacks) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-3 md:p-6">
          <div className="mb-4 flex flex-col gap-3 md:mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="p-3 md:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between md:gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {isMobile ? "Meus Feedbacks" : "Meus Feedbacks e Sugestões"}
            </h1>
            <p className="text-xs text-gray-600 md:text-base">
              {isMobile
                ? "Envie sugestões e acompanhe respostas"
                : "Envie feedbacks, sugestões e acompanhe as respostas da nossa equipe."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshFeedbacks} disabled={loading.feedbacks}>
              <RefreshCw className={`mr-1 h-3 w-3 ${loading.feedbacks ? "animate-spin" : ""}`} />
              {isMobile ? "" : "Atualizar"}
            </Button>
            {!isMobile && <NotificationDropdown />}
          </div>
        </div>

        {/* Error Alert */}
        {error.feedbacks && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error.feedbacks}
              <Button
                variant="outline"
                size="sm"
                className="ml-2 bg-transparent"
                onClick={() => {
                  clearError("feedbacks")
                  refreshFeedbacks()
                }}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards Mobile */}
        {isMobile && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Card className="border-none bg-gradient-to-r from-blue-50 to-blue-100 p-3 shadow-sm">
              <div className="text-center">
                <p className="text-xs font-medium text-blue-700">Total</p>
                <p className="text-lg font-bold text-blue-900">{feedbacks.length}</p>
              </div>
            </Card>
            <Card className="border-none bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 shadow-sm">
              <div className="text-center">
                <p className="text-xs font-medium text-yellow-700">Pendentes</p>
                <p className="text-lg font-bold text-yellow-900">
                  {feedbacks.filter((f) => f.status === FeedbackStatus.PENDING).length}
                </p>
              </div>
            </Card>
            <Card className="border-none bg-gradient-to-r from-green-50 to-green-100 p-3 shadow-sm">
              <div className="text-center">
                <p className="text-xs font-medium text-green-700">Respondidos</p>
                <p className="text-lg font-bold text-green-900">
                  {feedbacks.filter((f) => f.status === FeedbackStatus.RESOLVED).length}
                </p>
              </div>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg md:text-xl">Seus Feedbacks</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Acompanhe o status das suas mensagens
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Filtros */}
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="answered">Respondidos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#df0e67] hover:bg-[#c00c5a]">
                        <Plus className="mr-1 h-4 w-4" />
                        {isMobile ? "" : "Novo Feedback"}
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                {filteredFeedbacks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {filter === "pending"
                        ? "Nenhum feedback pendente"
                        : filter === "answered"
                          ? "Nenhum feedback respondido"
                          : "Nenhum feedback encontrado"}
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-4">
                      {filter === "all"
                        ? "Envie seu primeiro feedback para nossa equipe."
                        : "Altere o filtro para ver outros feedbacks."}
                    </p>
                    {filter === "all" && (
                      <Button onClick={() => setIsCreateOpen(true)} className="bg-[#df0e67] hover:bg-[#c00c5a]">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeiro Feedback
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFeedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold">
                                <MessageCircle className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm md:text-base">{feedback.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{feedback.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getFeedbackTypeLabel(feedback.type)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {getFeedbackCategoryLabel(feedback.category)}
                                  </Badge>
                                  {feedback.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs">{feedback.rating}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className={`text-xs ${getStatusColor(feedback.status)}`}>
                              {getFeedbackStatusLabel(feedback.status)}
                            </Badge>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(feedback.createdDate)}</span>
                              <Clock className="h-3 w-3 ml-1" />
                              <span>{formatTime(feedback.createdDate)}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(feedback)}
                              className="text-xs"
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>

                        {feedback.adminResponse && (
                          <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Resposta da Equipe</span>
                              {feedback.responseDate && (
                                <span className="text-xs text-green-600">{formatDate(feedback.responseDate)}</span>
                              )}
                            </div>
                            <p className="text-sm text-green-700">{feedback.adminResponse}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com estatísticas */}
          {!isMobile && (
            <div className="space-y-4">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                  <CardDescription className="text-xs">Resumo dos seus feedbacks</CardDescription>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Feedbacks</span>
                      <span className="font-bold text-blue-600">{feedbacks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pendentes</span>
                      <span className="font-bold text-yellow-600">
                        {feedbacks.filter((f) => f.status === FeedbackStatus.PENDING).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Respondidos</span>
                      <span className="font-bold text-green-600">
                        {feedbacks.filter((f) => f.status === FeedbackStatus.RESOLVED).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de Resposta</span>
                      <span className="font-bold text-purple-600">
                        {feedbacks.length > 0
                          ? Math.round(
                              (feedbacks.filter((f) => f.status === FeedbackStatus.RESOLVED).length /
                                feedbacks.length) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Modal de Criação */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="mx-4 sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Novo Feedback</DialogTitle>
              <DialogDescription>
                Compartilhe sua experiência, sugestões ou relate problemas para nossa equipe.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type?.toString() || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: Number.parseInt(value) as FeedbackType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FeedbackType.COMPLAINT.toString()}>Reclamação</SelectItem>
                      <SelectItem value={FeedbackType.SUGGESTION.toString()}>Sugestão</SelectItem>
                      <SelectItem value={FeedbackType.COMPLIMENT.toString()}>Elogio</SelectItem>
                      <SelectItem value={FeedbackType.QUESTION.toString()}>Dúvida</SelectItem>
                      <SelectItem value={FeedbackType.BUG_REPORT.toString()}>Relatório de Bug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category?.toString() || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: Number.parseInt(value) as FeedbackCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FeedbackCategory.APP.toString()}>Aplicativo</SelectItem>
                      <SelectItem value={FeedbackCategory.SERVICE.toString()}>Atendimento</SelectItem>
                      <SelectItem value={FeedbackCategory.CONTENT.toString()}>Conteúdo</SelectItem>
                      <SelectItem value={FeedbackCategory.TECHNICAL.toString()}>Técnico</SelectItem>
                      <SelectItem value={FeedbackCategory.BILLING.toString()}>Cobrança</SelectItem>
                      <SelectItem value={FeedbackCategory.OTHER.toString()}>Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resumo do seu feedback"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva detalhadamente sua experiência, sugestão ou problema"
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="rating">Avaliação Geral</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: !!checked })}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Enviar como anônimo
                </Label>
              </div>

              {error.creating && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error.creating}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className={`${isMobile ? "flex-col gap-2" : ""}`}>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className={`${isMobile ? "flex-1" : ""}`}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateFeedback}
                className={`bg-[#df0e67] hover:bg-[#c00c5a] ${isMobile ? "flex-1" : ""}`}
                disabled={loading.creating || !formData.title.trim() || !formData.description.trim()}
              >
                {loading.creating ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalhes */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="mx-4 sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedFeedback?.title}</DialogTitle>
              <DialogDescription>
                Detalhes do feedback enviado em {selectedFeedback && formatDate(selectedFeedback.createdDate)}
              </DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <p className="text-sm text-gray-600">{getFeedbackTypeLabel(selectedFeedback.type)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Categoria</Label>
                    <p className="text-sm text-gray-600">{getFeedbackCategoryLabel(selectedFeedback.category)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getStatusColor(selectedFeedback.status)}>
                      {getFeedbackStatusLabel(selectedFeedback.status)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedFeedback.description}</p>
                </div>

                {selectedFeedback.rating > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Avaliação</Label>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= selectedFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">({selectedFeedback.rating}/5)</span>
                    </div>
                  </div>
                )}

                {selectedFeedback.adminResponse && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <Label className="text-sm font-medium text-green-800">Resposta da Equipe</Label>
                    <p className="text-sm text-green-700 mt-1">{selectedFeedback.adminResponse}</p>
                    {selectedFeedback.responseDate && (
                      <p className="text-xs text-green-600 mt-2">
                        Respondido em {formatDate(selectedFeedback.responseDate)} às{" "}
                        {formatTime(selectedFeedback.responseDate)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailsOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
