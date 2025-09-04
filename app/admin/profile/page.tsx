"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { UserService } from "@/services/user-service"
import { type User, type UpdateUserData, getUserTypeLabel, getUserStatusLabel } from "@/types/user"
import { useUserContext } from "@/contexts/user-context"
import { Camera, Save, X, AlertCircle, UserIcon, Mail, Phone, Calendar, Building } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<UpdateUserData>({
    name: "",
    username: "",
    email: "",
    type: 1,
    status: 1,
    phone: "",
    avatar: "",
    clientId: 0,
    empresaId: 0,
  })

  const { toast } = useToast()
  const { state } = useUserContext()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar o ID do usuário logado
      const userId = state.currentUser?.id || 1
      const userData = await UserService.getUser(userId)

      setUser(userData)
      setFormData({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        type: userData.type,
        status: userData.statusEnum,
        phone: userData.phone || "",
        avatar: userData.avatar || "",
        clientId: userData.clientId,
        empresaId: userData.empresaId,
      })
    } catch (err) {
      setError("Erro ao carregar dados do perfil")
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const userId = user?.id || 1
      await UserService.updateUser(userId, formData)

      // Recarregar dados
      await loadUserData()
      setEditing(false)

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      })
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email,
        type: user.type,
        status: user.statusEnum,
        phone: user.phone || "",
        avatar: user.avatar || "",
        clientId: user.clientId,
        empresaId: user.empresaId,
      })
    }
    setEditing(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      const avatarUrl = await UserService.uploadAvatar(file)
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }))

      toast({
        title: "Sucesso",
        description: "Avatar atualizado com sucesso",
      })
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem",
        variant: "destructive",
      })
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" className="ml-4 bg-transparent" onClick={loadUserData}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Editar Perfil</Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Gerencie suas informações pessoais e configurações da conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name} />
                  <AvatarFallback className="bg-gradient-to-r from-black to-gray-800 text-white text-xl">
                    {formData.name ? getUserInitials(formData.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <label className="absolute -bottom-2 -right-2 bg-black text-white rounded-full p-2 cursor-pointer hover:bg-gray-800 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="flex space-x-2">
                  <Badge variant="secondary">{user ? getUserTypeLabel(user.type) : ""}</Badge>
                  <Badge variant={user?.status === "active" ? "default" : "secondary"}>
                    {user ? getUserStatusLabel(user.statusEnum) : ""}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <UserIcon className="h-4 w-4 inline mr-2" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  <UserIcon className="h-4 w-4 inline mr-2" />
                  Nome de Usuário *
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={!editing}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  <Building className="h-4 w-4 inline mr-2" />
                  ID da Empresa
                </Label>
                <Input value={formData.empresaId} disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label>
                  <UserIcon className="h-4 w-4 inline mr-2" />
                  ID do Cliente
                </Label>
                <Input value={formData.clientId} disabled className="bg-gray-50" />
              </div>
            </div>

            {/* Metadata */}
            {user && (
              <div className="pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Informações da Conta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Criado em:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Atualizado em:</span>
                    <span>{new Date(user.updatedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
