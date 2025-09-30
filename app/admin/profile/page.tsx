"use client"

import type React from "react"
import { useUserContext } from "@/contexts/user-context" // Import the useUserContext hook

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
import { CompanyService } from "@/services/company-service"
import { type User, type UpdateUserData, getUserTypeLabel, getUserStatusLabel } from "@/types/user"
import {
  Camera,
  Save,
  X,
  AlertCircle,
  UserIcon,
  Mail,
  Phone,
  Calendar,
  Building,
  UserIcon as UserIconSolid,
  Shield,
  Activity,
  Settings,
} from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string>("")
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
  const { state } = useUserContext() // Use the imported useUserContext hook

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

      if (userData.empresaId) {
        try {
          const response = await CompanyService.getCompanies()
          const companyList: any[] = Array.isArray(response) ? response : (response?.result ?? [])
          const company = companyList.find((c: any) => c?.id === userData.empresaId)
          setCompanyName(company?.name || `Empresa ${userData.empresaId}`)
        } catch (err) {
          setCompanyName(`Empresa ${userData.empresaId}`)
        }
      }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white/20">
                    <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name} />
                    <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                      {formData.name ? getUserInitials(formData.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <label className="absolute -bottom-2 -right-2 bg-white text-indigo-600 rounded-full p-2 cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                      <Camera className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user?.name || "Meu Perfil"}</h1>
                  <p className="text-white/80 mb-3">{user?.email}</p>
                  <div className="flex gap-2">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {user ? getUserTypeLabel(user.type) : ""}
                    </Badge>
                    <Badge
                      className={`border-white/30 ${user?.status === "active" ? "bg-green-500/20 text-green-100" : "bg-gray-500/20 text-gray-100"}`}
                    >
                      {user ? getUserStatusLabel(user.statusEnum) : ""}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-white text-indigo-600 hover:bg-gray-100"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600"></div>
            <CardContent className="relative z-10 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tipo de Usuário</p>
                  <p className="text-2xl font-bold">{user ? getUserTypeLabel(user.type) : "-"}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIconSolid className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600"></div>
            <CardContent className="relative z-10 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Status</p>
                  <p className="text-2xl font-bold">{user ? getUserStatusLabel(user.statusEnum) : "-"}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600"></div>
            <CardContent className="relative z-10 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Empresa</p>
                  <p className="text-2xl font-bold">{companyName || "-"}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600"></div>
            <CardContent className="relative z-10 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Ativo desde</p>
                  <p className="text-2xl font-bold">
                    {user
                      ? new Date(user.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
                      : "-"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-xl text-gray-800">Informações Pessoais</CardTitle>
            <CardDescription>Gerencie suas informações pessoais e configurações da conta</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                  required
                  className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  Nome de Usuário *
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  disabled={!editing}
                  required
                  className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                  required
                  className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={!editing}
                  placeholder="(00) 00000-0000"
                  className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  Empresa
                </Label>
                <Input value={companyName || "Não informado"} disabled className="h-11 bg-gray-50 border-gray-200" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  ID do Cliente
                </Label>
                <Input value={formData.clientId} disabled className="h-11 bg-gray-50 border-gray-200" />
              </div>
            </div>

            {/* Metadata */}
            {user && (
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Criado em</p>
                      <p className="text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Atualizado em</p>
                      <p className="text-sm text-gray-600">{new Date(user.updatedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
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
