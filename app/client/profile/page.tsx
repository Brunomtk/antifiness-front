"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, Save, User, Mail, Phone, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientProfile } from "@/hooks/use-client-profile"

export default function ProfilePage() {
  const { profile, isLoading, isUpdating, error, updateProfile, uploadAvatar } = useClientProfile()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    avatar: "",
  })
  const [successMessage, setSuccessMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Atualizar formData quando profile carregar
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
        avatar: profile.avatar || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setSuccessMessage("Perfil atualizado com sucesso!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      console.error("Erro ao salvar:", err)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem")
      return
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB")
      return
    }

    try {
      const avatarUrl = await uploadAvatar(file)
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }))
      setSuccessMessage("Avatar atualizado com sucesso!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      console.error("Erro ao fazer upload:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
        <div className="p-3 md:p-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card className="border-none shadow-sm max-w-2xl mx-auto">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
        <div className="p-3 md:p-6">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Não foi possível carregar os dados do perfil. Tente novamente.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <div className="p-3 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 max-w-2xl mx-auto">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card className="border-none shadow-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#df0e67]" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Mantenha seus dados atualizados para um melhor atendimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name} />
                <AvatarFallback className="text-base md:text-lg">
                  {formData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                <p className="text-gray-600 text-sm">Clique no botão para alterar sua foto</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent min-h-[48px]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                  Alterar Foto
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="pl-10 min-h-[48px]"
                    disabled={isUpdating}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    className="pl-10 min-h-[48px]"
                    disabled={isUpdating}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10 min-h-[48px]"
                    disabled={isUpdating}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="pl-10 min-h-[48px]"
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-[#df0e67] hover:bg-[#c00c5a] min-h-[48px]"
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isUpdating ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
