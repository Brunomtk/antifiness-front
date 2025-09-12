"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Plus,
  Search,
  Users,
  UserCheck,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Shield,
  User,
  RefreshCw,
  Filter,
  Mail,
  Calendar,
} from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { useClients } from "@/hooks/use-client"
import { useUserContext } from "@/contexts/user-context"
import { UserType, UserStatus, getUserTypeLabel, getUserStatusLabel } from "@/types/user"
import type { CreateUserData, User as UserInterface } from "@/types/user"

export default function UsersPage() {
  const {
    users,
    stats,
    loading,
    creating,
    updating,
    deleting,
    fetchUsers,
    fetchUserStats,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers()

  const { clients, fetchClients } = useClients()
  const { state: userState } = useUserContext()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null)

  const [newUser, setNewUser] = useState<CreateUserData>({
    name: "",
    username: "",
    email: "",
    password: "",
    type: UserType.CLIENT,
    status: UserStatus.ACTIVE,
    phone: "",
    avatar: "",
    clientId: undefined,
    empresaId: userState.currentUser?.empresaId || 1,
  })

  useEffect(() => {
    if (isCreateDialogOpen && newUser.type === UserType.CLIENT) {
      fetchClients()
    }
  }, [isCreateDialogOpen, newUser.type, fetchClients])

  useEffect(() => {
    if (userState.currentUser?.empresaId) {
      setNewUser((prev) => ({
        ...prev,
        empresaId: userState.currentUser.empresaId,
      }))
    }
  }, [userState.currentUser])

  useEffect(() => {
    fetchUsers()
    fetchUserStats()
  }, [fetchUsers, fetchUserStats])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      const params: any = {}
      if (searchQuery.trim()) params.search = searchQuery
      if (selectedRole !== "all") params.role = selectedRole
      if (selectedStatus !== "all") params.status = selectedStatus

      fetchUsers(params)
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, selectedRole, selectedStatus, fetchUsers])

  const handleCreateUser = async () => {
    try {
      const userData = {
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        type: newUser.type,
        status: newUser.status,
        phone: newUser.phone,
        avatar: newUser.avatar || "string",
        clientId: newUser.clientId || null,
        empresaId: userState.currentUser?.empresaId || 1,
      }

      await createUser(userData)
      setNewUser({
        name: "",
        username: "",
        email: "",
        password: "",
        type: UserType.CLIENT,
        status: UserStatus.ACTIVE,
        phone: "",
        avatar: "",
        clientId: undefined,
        empresaId: userState.currentUser?.empresaId || 1,
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      await updateUser(selectedUser.id, {
        name: selectedUser.name,
        username: selectedUser.username,
        email: selectedUser.email,
        type: selectedUser.type,
        status: selectedUser.statusEnum,
        phone: selectedUser.phone,
        avatar: selectedUser.avatar,
        clientId: selectedUser.clientId,
        empresaId: selectedUser.empresaId,
      })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await deleteUser(id)
      } catch (error) {
        console.error("Erro ao excluir usuário:", error)
      }
    }
  }

  const openEditDialog = (user: UserInterface) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const openDetailsDialog = (user: UserInterface) => {
    setSelectedUser(user)
    setIsDetailsDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários da Empresa</h1>
            <p className="text-cyan-100">Gerencie os usuários da sua empresa</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-cyan-700 hover:bg-cyan-50">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>Adicione um novo usuário à sua empresa.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-name">Nome Completo</Label>
                    <Input
                      id="user-name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-username">Nome de Usuário</Label>
                    <Input
                      id="user-username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="Ex: joao.silva"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Ex: joao@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-phone">Telefone</Label>
                    <Input
                      id="user-phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="user-password">Senha</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Digite uma senha segura"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-type">Tipo de Usuário</Label>
                    <Select
                      value={newUser.type.toString()}
                      onValueChange={(value) => {
                        const userType = Number(value) as UserType
                        setNewUser({
                          ...newUser,
                          type: userType,
                          clientId: userType === UserType.ADMIN ? undefined : newUser.clientId,
                        })
                      }}
                    >
                      <SelectTrigger id="user-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Cliente</SelectItem>
                        <SelectItem value="1">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="user-status">Status</Label>
                    <Select
                      value={newUser.status.toString()}
                      onValueChange={(value) => setNewUser({ ...newUser, status: Number(value) as UserStatus })}
                    >
                      <SelectTrigger id="user-status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ativo</SelectItem>
                        <SelectItem value="0">Inativo</SelectItem>
                        <SelectItem value="2">Pendente</SelectItem>
                        <SelectItem value="3">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newUser.type === UserType.CLIENT && (
                  <div>
                    <Label htmlFor="user-client">Cliente Associado</Label>
                    <Select
                      value={newUser.clientId?.toString() || "none"}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, clientId: value === "none" ? undefined : Number(value) })
                      }
                    >
                      <SelectTrigger id="user-client">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum cliente</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name} - {client.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="user-company">Empresa</Label>
                  <Input
                    id="user-company"
                    value={`Empresa ID: ${userState.currentUser?.empresaId || 1}`}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A empresa é automaticamente definida com base no usuário logado
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={creating}>
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Criar Usuário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Usuários</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-blue-100 mt-2">{stats.newUsersThisMonth} novos este mês</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-green-100 mt-2">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% do total
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Administradores</p>
                  <p className="text-2xl font-bold">{stats.totalAdmins}</p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-purple-100 mt-2">{stats.verifiedAdmins} verificados</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Crescimento</p>
                  <p className="text-2xl font-bold">{stats.growthPercentage}%</p>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-orange-100 mt-2">vs. mês anterior</p>
            </div>
          </div>
        </div>
      )}

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
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
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={() => fetchUsers()} className="w-full">
                Buscar
              </Button>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedRole("all")
                  setSelectedStatus("all")
                  fetchUsers()
                }}
                className="w-full"
              >
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Visualize e gerencie todos os usuários da empresa</CardDescription>
          </div>
          <Button variant="outline" onClick={() => fetchUsers()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
              </div>
            </div>
          ) : users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.type === UserType.ADMIN
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                        }
                      >
                        {user.type === UserType.ADMIN ? (
                          <Shield className="mr-1 h-3 w-3" />
                        ) : (
                          <User className="mr-1 h-3 w-3" />
                        )}
                        {getUserTypeLabel(user.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.statusEnum === UserStatus.ACTIVE ? "default" : "secondary"}
                        className={
                          user.statusEnum === UserStatus.ACTIVE
                            ? "bg-green-100 text-green-800 border-green-200"
                            : user.statusEnum === UserStatus.PENDING
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {getUserStatusLabel(user.statusEnum)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openDetailsDialog(user)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar usuário</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir usuário</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2 text-lg font-medium">Nenhum usuário encontrado</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchQuery || selectedRole !== "all" || selectedStatus !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Comece adicionando seu primeiro usuário."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize as informações do usuário.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-user-name">Nome Completo</Label>
                  <Input
                    id="edit-user-name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-user-username">Nome de Usuário</Label>
                  <Input
                    id="edit-user-username"
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-user-email">Email</Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-user-phone">Telefone</Label>
                  <Input
                    id="edit-user-phone"
                    value={selectedUser.phone || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-user-type">Tipo de Usuário</Label>
                  <Select
                    value={selectedUser.type.toString()}
                    onValueChange={(value) => setSelectedUser({ ...selectedUser, type: Number(value) as UserType })}
                  >
                    <SelectTrigger id="edit-user-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Cliente</SelectItem>
                      <SelectItem value="1">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-user-status">Status</Label>
                  <Select
                    value={selectedUser.statusEnum.toString()}
                    onValueChange={(value) =>
                      setSelectedUser({ ...selectedUser, statusEnum: Number(value) as UserStatus })
                    }
                  >
                    <SelectTrigger id="edit-user-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ativo</SelectItem>
                      <SelectItem value="0">Inativo</SelectItem>
                      <SelectItem value="2">Pendente</SelectItem>
                      <SelectItem value="3">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={updating}>
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalhes do Usuário
            </DialogTitle>
            <DialogDescription>Informações completas do usuário selecionado.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 ring-4 ring-blue-200">
                    <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-blue-700">@{selectedUser.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={
                          selectedUser.type === UserType.ADMIN
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                        }
                      >
                        {selectedUser.type === UserType.ADMIN ? (
                          <Shield className="mr-1 h-3 w-3" />
                        ) : (
                          <User className="mr-1 h-3 w-3" />
                        )}
                        {getUserTypeLabel(selectedUser.type)}
                      </Badge>
                      <Badge
                        variant={selectedUser.statusEnum === UserStatus.ACTIVE ? "default" : "secondary"}
                        className={
                          selectedUser.statusEnum === UserStatus.ACTIVE
                            ? "bg-green-100 text-green-800 border-green-200"
                            : selectedUser.statusEnum === UserStatus.PENDING
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {getUserStatusLabel(selectedUser.statusEnum)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                      <Mail className="h-5 w-5" />
                      Informações de Contato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="font-mono text-sm bg-white p-2 rounded border">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                      <p className="font-mono text-sm bg-white p-2 rounded border">
                        {selectedUser.phone || "Não informado"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-purple-800 text-lg">
                      <Calendar className="h-5 w-5" />
                      Informações do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">ID do Usuário</Label>
                      <p className="font-mono text-sm bg-white p-2 rounded border">#{selectedUser.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Data de Criação</Label>
                      <p className="text-sm bg-white p-2 rounded border">
                        {new Date(selectedUser.createdAt).toLocaleDateString("pt-BR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Última Atualização</Label>
                      <p className="text-sm bg-white p-2 rounded border">
                        {selectedUser.updatedAt
                          ? new Date(selectedUser.updatedAt).toLocaleDateString("pt-BR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Não atualizado"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(selectedUser.clientId || selectedUser.empresaId) && (
                <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-amber-800 text-lg">
                      <Shield className="h-5 w-5" />
                      Informações Adicionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedUser.clientId && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">ID do Cliente</Label>
                        <p className="font-mono text-sm bg-white p-2 rounded border">#{selectedUser.clientId}</p>
                      </div>
                    )}
                    {selectedUser.empresaId && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">ID da Empresa</Label>
                        <p className="font-mono text-sm bg-white p-2 rounded border">#{selectedUser.empresaId}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                setIsDetailsDialogOpen(false)
                if (selectedUser) openEditDialog(selectedUser)
              }}
            >
              Editar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
