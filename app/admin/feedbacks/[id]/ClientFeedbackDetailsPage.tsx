"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Star,
  User,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Tag,
  LinkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFeedback } from "@/contexts/feedback-context"
import { FeedbackType, FeedbackStatus, FeedbackStatusNames } from "@/types/feedback"

interface ClientFeedbackDetailsPageProps {
  feedbackId?: string
}

export default function ClientFeedbackDetailsPage({ feedbackId }: ClientFeedbackDetailsPageProps) {
  const router = useRouter()
  const feedbackIdNumber = feedbackId ? Number(feedbackId) : 0

  const { state, fetchFeedbackById, updateFeedback } = useFeedback()
  const [response, setResponse] = useState("")
  const [newStatus, setNewStatus] = useState<FeedbackStatus | "">("")
  const [isResponding, setIsResponding] = useState(false)

  // Carregar feedback
  useEffect(() => {
    if (feedbackIdNumber) {
      fetchFeedbackById(feedbackIdNumber)
    }
  }, [feedbackIdNumber, fetchFeedbackById])

  // Definir status inicial quando feedback carregar
  useEffect(() => {
    if (state.selectedFeedback && !newStatus) {
      setNewStatus(state.selectedFeedback.status)
    }
  }, [state.selectedFeedback, newStatus])

  // Enviar resposta
  const handleSendResponse = async () => {
    if (!response.trim() || !state.selectedFeedback) return

    setIsResponding(true)
    try {
      // Aqui você implementaria a lógica para enviar a resposta
      // Por enquanto, vamos simular
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Atualizar status para resolvido se ainda não estiver
      if (newStatus === FeedbackStatus.PENDING) {
        setNewStatus(FeedbackStatus.RESOLVED)
      }

      setResponse("")
      // Mostrar sucesso
    } catch (error) {
      console.error("Erro ao enviar resposta:", error)
    } finally {
      setIsResponding(false)
    }
  }

  // Atualizar status
  const handleUpdateStatus = async () => {
    if (!state.selectedFeedback || !newStatus || newStatus === state.selectedFeedback.status) return

    try {
      await updateFeedback(state.selectedFeedback.id, { status: newStatus })
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  // Renderizar estrelas
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-5 w-5 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
        ))}
        <span className="ml-2 text-sm font-medium">{rating} de 5</span>
      </div>
    )
  }

  // Renderizar badge de status
  const renderStatusBadge = (status: FeedbackStatus, statusName: string) => {
    const colors = {
      [FeedbackStatus.PENDING]: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
      [FeedbackStatus.IN_PROGRESS]: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
      [FeedbackStatus.RESOLVED]: "bg-gradient-to-r from-green-400 to-green-500 text-white",
      [FeedbackStatus.CLOSED]: "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
      [FeedbackStatus.ESCALATED]: "bg-gradient-to-r from-red-400 to-red-500 text-white",
    }

    return (
      <Badge className={`${colors[status] || "bg-gray-100 text-gray-800"} px-3 py-1 text-sm font-medium`}>
        {statusName}
      </Badge>
    )
  }

  // Renderizar badge de tipo
  const renderTypeBadge = (type: FeedbackType, typeName: string) => {
    const colors = {
      [FeedbackType.COMPLAINT]: "bg-gradient-to-r from-red-400 to-red-500 text-white",
      [FeedbackType.SUGGESTION]: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
      [FeedbackType.COMPLIMENT]: "bg-gradient-to-r from-green-400 to-green-500 text-white",
      [FeedbackType.QUESTION]: "bg-gradient-to-r from-purple-400 to-purple-500 text-white",
      [FeedbackType.BUG_REPORT]: "bg-gradient-to-r from-orange-400 to-orange-500 text-white",
    }

    return (
      <Badge className={`${colors[type] || "bg-gray-100 text-gray-800"} px-3 py-1 text-sm font-medium`}>
        {typeName}
      </Badge>
    )
  }

  if (state.loading.feedbacks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando detalhes do feedback...</p>
        </div>
      </div>
    )
  }

  if (!state.selectedFeedback) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Feedback não encontrado.</p>
          <Button variant="outline" onClick={() => router.push("/admin/feedbacks")} className="mt-4">
            Voltar para lista
          </Button>
        </div>
      </div>
    )
  }

  const feedback = state.selectedFeedback

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/feedbacks")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Detalhes do Feedback</h1>
          <p className="text-muted-foreground">Visualize e responda ao feedback do cliente</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal - Detalhes do feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card principal do feedback */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{feedback.title}</CardTitle>
                  <div className="flex items-center gap-3">
                    {renderTypeBadge(feedback.type, feedback.typeName)}
                    <Badge variant="outline" className="bg-white">
                      {feedback.categoryName}
                    </Badge>
                  </div>
                </div>
                {renderStatusBadge(feedback.status, feedback.statusName)}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Avaliação */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Avaliação do Cliente</p>
                    {renderStars(feedback.rating)}
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Descrição</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback.description}</p>
                  </div>
                </div>

                {/* Anexo (se houver) */}
                {feedback.attachmentUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">Anexo</h3>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <a
                        href={feedback.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Ver anexo
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de resposta */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Responder ao Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Digite sua resposta ao cliente..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendResponse}
                    disabled={!response.trim() || isResponding}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {isResponding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Resposta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Informações do cliente e ações */}
        <div className="space-y-6">
          {/* Informações do cliente */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="rounded-full bg-green-100 p-2">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{feedback.isAnonymous ? "Cliente Anônimo" : feedback.clientName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID do Cliente</p>
                    <p className="font-medium">{feedback.clientId}</p>
                  </div>
                </div>

                {feedback.isAnonymous && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Feedback Anônimo</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                      Este feedback foi enviado de forma anônima.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações temporais */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Informações Temporais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="rounded-full bg-purple-100 p-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="font-medium">
                      {new Date(feedback.createdDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Última atualização</p>
                    <p className="font-medium">
                      {new Date(feedback.lastModifiedDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                Alterar Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Select
                  value={newStatus.toString()}
                  onValueChange={(value) => setNewStatus(Number(value) as FeedbackStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FeedbackStatusNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {newStatus !== feedback.status && (
                  <Button
                    onClick={handleUpdateStatus}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    disabled={state.loading.updating}
                  >
                    {state.loading.updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Atualizar Status
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
