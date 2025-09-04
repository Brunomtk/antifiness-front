"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  CheckCheck,
  Trash2,
  Plus,
  RefreshCcw,
  MessageSquare,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react"
import { notificationService } from "@/services/notification-service"
import type {
  Notification,
  NotificationStats,
  NotificationFilters,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from "@/types/notification"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const { toast } = useToast()

  // Carregar dados iniciais
  useEffect(() => {
    loadNotifications()
    loadStats()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const filters: NotificationFilters = {}

      if (selectedType !== "all") filters.type = Number(selectedType) as NotificationType
      if (selectedCategory !== "all") filters.category = Number(selectedCategory) as NotificationCategory
      if (selectedPriority !== "all") filters.priority = Number(selectedPriority) as NotificationPriority
      if (selectedStatus !== "all") filters.read = selectedStatus === "read"

      const data = await notificationService.getNotifications(filters)
      setNotifications(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar notificações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await notificationService.getStats()
      setStats(data)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    loadNotifications()
  }, [selectedType, selectedCategory, selectedPriority, selectedStatus])

  // Filtrar por busca
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleMarkAsRead = async (id: number) => {
    try {
      setMarkingAsRead(id)
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
      )
      loadStats()
      toast({
        title: "Sucesso",
        description: "Notificação marcada como lida",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao marcar como lida",
        variant: "destructive",
      })
    } finally {
      setMarkingAsRead(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true)
      // Assumindo userId = 1 para admin, ajustar conforme necessário
      await notificationService.markAllAsRead(1)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })))
      loadStats()
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao marcar todas como lidas",
        variant: "destructive",
      })
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id)
      await notificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      loadStats()
      toast({
        title: "Sucesso",
        description: "Notificação excluída",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir notificação",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 1:
        return <Bell className="h-4 w-4" /> // SYSTEM
      case 2:
        return <MessageSquare className="h-4 w-4" /> // DIET
      case 3:
        return <TrendingUp className="h-4 w-4" /> // WORKOUT
      case 4:
        return <Calendar className="h-4 w-4" /> // PLAN
      case 5:
        return <MessageSquare className="h-4 w-4" /> // MESSAGE
      case 6:
        return <Clock className="h-4 w-4" /> // REMINDER
      case 7:
        return <CheckCircle className="h-4 w-4" /> // ACHIEVEMENT
      case 8:
        return <AlertTriangle className="h-4 w-4" /> // ALERT
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 1:
        return "text-blue-500" // INFO
      case 2:
        return "text-green-500" // SUCCESS
      case 3:
        return "text-yellow-500" // WARNING
      case 4:
        return "text-red-500" // ERROR
      case 5:
        return "text-purple-500" // REMINDER
      default:
        return "text-gray-500"
    }
  }

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 1:
        return <Badge variant="secondary">Baixa</Badge>
      case 2:
        return <Badge variant="outline">Normal</Badge>
      case 3:
        return <Badge className="bg-orange-500 hover:bg-orange-600">Alta</Badge>
      case 4:
        return <Badge className="bg-red-500 hover:bg-red-600">Urgente</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const getTypeName = (type: NotificationType) => {
    const names = {
      1: "Sistema",
      2: "Dieta",
      3: "Treino",
      4: "Plano",
      5: "Mensagem",
      6: "Lembrete",
      7: "Conquista",
      8: "Alerta",
    }
    return names[type as keyof typeof names] || "Desconhecido"
  }

  const getCategoryName = (category: NotificationCategory) => {
    const names = {
      1: "Informação",
      2: "Sucesso",
      3: "Aviso",
      4: "Erro",
      5: "Lembrete",
    }
    return names[category as keyof typeof names] || "Desconhecido"
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">Gerencie todas as notificações do sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markingAllAsRead || !notifications.some((n) => !n.read)}
            variant="outline"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {markingAllAsRead ? "Marcando..." : "Marcar todas como lidas"}
          </Button>
          <Button className="bg-[#df0e67] hover:bg-[#df0e67]/90">
            <Plus className="mr-2 h-4 w-4" />
            Nova Notificação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-none bg-gradient-to-b from-muted/30 to-background hover:from-muted/40 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Total</div>
                <Bell className="h-4 w-4 opacity-60" />
              </div>
              <div className="mt-1 text-2xl font-semibold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-gradient-to-b from-muted/30 to-background hover:from-muted/40 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Não Lidas</div>
                <Zap className="h-4 w-4 opacity-60 text-[#df0e67]" />
              </div>
              <div className="mt-1 text-2xl font-semibold text-[#df0e67]">{stats.unread}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-gradient-to-b from-muted/30 to-background hover:from-muted/40 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Taxa de Leitura</div>
                <TrendingUp className="h-4 w-4 opacity-60" />
              </div>
              <div className="mt-1 text-2xl font-semibold">{Math.round(stats.readRate)}%</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-gradient-to-b from-muted/30 to-background hover:from-muted/40 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Tempo Médio</div>
                <Clock className="h-4 w-4 opacity-60" />
              </div>
              <div className="mt-1 text-2xl font-semibold">{Math.round(stats.averageReadTime)}min</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
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
                  placeholder="Buscar notificações..."
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
                  <SelectItem value="1">Sistema</SelectItem>
                  <SelectItem value="2">Dieta</SelectItem>
                  <SelectItem value="3">Treino</SelectItem>
                  <SelectItem value="4">Plano</SelectItem>
                  <SelectItem value="5">Mensagem</SelectItem>
                  <SelectItem value="6">Lembrete</SelectItem>
                  <SelectItem value="7">Conquista</SelectItem>
                  <SelectItem value="8">Alerta</SelectItem>
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
                  <SelectItem value="1">Informação</SelectItem>
                  <SelectItem value="2">Sucesso</SelectItem>
                  <SelectItem value="3">Aviso</SelectItem>
                  <SelectItem value="4">Erro</SelectItem>
                  <SelectItem value="5">Lembrete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="1">Baixa</SelectItem>
                  <SelectItem value="2">Normal</SelectItem>
                  <SelectItem value="3">Alta</SelectItem>
                  <SelectItem value="4">Urgente</SelectItem>
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
                  <SelectItem value="unread">Não lidas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Notificações</CardTitle>
          <Button variant="outline" onClick={loadNotifications} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação encontrada.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id}>
                    <div
                      className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                        !notification.read ? "bg-blue-50/50 border border-blue-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg" alt="Notificação" />
                          <AvatarFallback className="bg-gradient-to-r from-black to-gray-800 text-white">
                            N
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-sm ${getCategoryColor(notification.category)}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-[#df0e67] rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Badge variant="outline" className="text-xs">
                                {getTypeName(notification.type)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryName(notification.category)}
                              </Badge>
                              {getPriorityBadge(notification.priority)}
                              <span>•</span>
                              <span>
                                {format(new Date(notification.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                              {notification.readAt && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">
                                    Lida em{" "}
                                    {format(new Date(notification.readAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  disabled={markingAsRead === notification.id}
                                >
                                  <CheckCheck className="mr-2 h-4 w-4" />
                                  {markingAsRead === notification.id ? "Marcando..." : "Marcar como lida"}
                                </DropdownMenuItem>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir notificação?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. A notificação será removida permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(notification.id)}
                                      disabled={deleting === notification.id}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {deleting === notification.id ? "Excluindo..." : "Excluir"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
