"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Check, Loader2, Save, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFeedback } from "@/contexts/feedback-context"
import { FeedbackType, FeedbackCategory, FeedbackTypeNames, FeedbackCategoryNames } from "@/types/feedback"

export default function CreateFeedback() {
  const router = useRouter()
  const { createFeedback, state } = useFeedback()

  const [formData, setFormData] = useState({
    clientId: 1, // Por enquanto fixo, depois pode vir de um select
    trainerId: 1, // Por enquanto fixo, depois pode vir do usuário logado
    type: FeedbackType.COMPLAINT,
    category: FeedbackCategory.APP,
    title: "",
    description: "",
    rating: 5,
    attachmentUrl: "",
    isAnonymous: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Validar formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "O título é obrigatório"
    }

    if (!formData.description.trim()) {
      newErrors.description = "A descrição é obrigatória"
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "A avaliação deve ser entre 1 e 5"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Salvar feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await createFeedback(formData)
      setShowSuccess(true)
      setTimeout(() => {
        router.push("/admin/feedbacks")
      }, 1500)
    } catch (error) {
      console.error("Erro ao criar feedback:", error)
    }
  }

  // Renderizar estrelas para rating
  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className={`p-1 rounded transition-colors ${
              star <= formData.rating ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{formData.rating} de 5 estrelas</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/feedbacks")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo Feedback</h1>
          <p className="text-muted-foreground">Crie um novo feedback para análise.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo <span className="text-[#df0e67]">*</span>
                </Label>
                <Select
                  value={formData.type.toString()}
                  onValueChange={(value) => setFormData({ ...formData, type: Number.parseInt(value) as FeedbackType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FeedbackTypeNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoria <span className="text-[#df0e67]">*</span>
                </Label>
                <Select
                  value={formData.category.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: Number.parseInt(value) as FeedbackCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FeedbackCategoryNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-[#df0e67]">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Problema com o aplicativo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição <span className="text-[#df0e67]">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o feedback..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={errors.description ? "border-red-500" : ""}
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>
                Avaliação <span className="text-[#df0e67]">*</span>
              </Label>
              {renderStars()}
              {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachmentUrl">URL do Anexo (opcional)</Label>
              <Input
                id="attachmentUrl"
                placeholder="https://exemplo.com/arquivo.pdf"
                value={formData.attachmentUrl}
                onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isAnonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
              />
              <Label htmlFor="isAnonymous" className="cursor-pointer">
                Feedback anônimo
              </Label>
            </div>

            {formData.isAnonymous && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-600">Feedback Anônimo</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Este feedback será marcado como anônimo e o nome do cliente não será exibido.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/feedbacks")}
            disabled={state.loading.creating}
          >
            Cancelar
          </Button>

          <Button type="submit" className="bg-[#df0e67] hover:bg-[#df0e67]/90" disabled={state.loading.creating}>
            {state.loading.creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Feedback
              </>
            )}
          </Button>
        </div>
      </form>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Sucesso!</AlertTitle>
          <AlertDescription className="text-green-700">Feedback criado com sucesso! Redirecionando...</AlertDescription>
        </Alert>
      )}

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
