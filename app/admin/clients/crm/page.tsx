"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  MoreHorizontal,
  Calendar,
  Phone,
  Mail,
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Heart,
  UserPlus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useClients } from "@/hooks/use-client"
import { type Client, KanbanStage, getKanbanStageLabel } from "@/types/client"

// Definição dos estágios do CRM
const CRM_STAGES = [
  {
    id: KanbanStage.LEAD,
    name: "Lead",
    description: "Cliente potencial inicial",
    color: "bg-yellow-100 border-yellow-300",
    headerColor: "bg-yellow-500",
    icon: UserPlus,
  },
  {
    id: KanbanStage.PROSPECT,
    name: "Prospect",
    description: "Cliente qualificado como possível comprador",
    color: "bg-blue-100 border-blue-300",
    headerColor: "bg-blue-500",
    icon: Target,
  },
  {
    id: KanbanStage.ACTIVE,
    name: "Ativo",
    description: "Cliente ativo em acompanhamento",
    color: "bg-green-100 border-green-300",
    headerColor: "bg-green-500",
    icon: Heart,
  },
  {
    id: KanbanStage.INACTIVE,
    name: "Inativo",
    description: "Cliente pausado ou inativo",
    color: "bg-gray-100 border-gray-300",
    headerColor: "bg-gray-500",
    icon: Clock,
  },
  {
    id: KanbanStage.COMPLETED,
    name: "Concluído",
    description: "Objetivos alcançados com sucesso",
    color: "bg-purple-100 border-purple-300",
    headerColor: "bg-purple-500",
    icon: CheckCircle,
  },
]

interface CRMClient extends Client {
  lastContact?: string
  nextFollowUp?: string
  notes?: string
  priority?: "low" | "medium" | "high"
}

export default function CRMPage() {
  const { toast } = useToast()
  const { clients, loading, error, fetchClients, updateClient } = useClients()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null)
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [draggedClient, setDraggedClient] = useState<CRMClient | null>(null)

  // Carregar clientes ao montar o componente
  useEffect(() => {
    console.log("[v0] CRM Page mounted, fetching clients...")
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    console.log("[v0] Clients updated in CRM:", clients)
    console.log("[v0] Loading state:", loading)
    console.log("[v0] Error state:", error)
  }, [clients, loading, error])

  // Agrupar clientes por estágio
  const clientsByStage = CRM_STAGES.reduce(
    (acc, stage) => {
      const stageClients = clients.filter((client) => {
        console.log("[v0] Client kanbanStage:", client.kanbanStage, "Stage ID:", stage.id)
        return client.kanbanStage === stage.id
      })
      acc[stage.id] = stageClients
      console.log("[v0] Stage", stage.name, "has", stageClients.length, "clients")
      return acc
    },
    {} as Record<KanbanStage, Client[]>,
  )

  // Filtrar clientes por busca
  const filteredClientsByStage = Object.keys(clientsByStage).reduce(
    (acc, stageId) => {
      const stage = Number.parseInt(stageId) as KanbanStage
      acc[stage] = clientsByStage[stage].filter(
        (client) =>
          (client.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
      return acc
    },
    {} as Record<KanbanStage, Client[]>,
  )

  // Mover cliente para outro estágio
  const moveClient = async (clientId: number, newStage: KanbanStage) => {
    try {
      const client = clients.find((c) => c.id === clientId)
      if (!client) return

      const updateData = {
        ...client,
        kanbanStage: newStage,
      }

      await updateClient(clientId, updateData)
      toast({
        title: "Sucesso",
        description: `Cliente movido para ${getKanbanStageLabel(newStage)}`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao mover cliente",
        variant: "destructive",
      })
    }
  }

  // Handlers para drag and drop
  const handleDragStart = (client: CRMClient) => {
    setDraggedClient(client)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStage: KanbanStage) => {
    e.preventDefault()
    if (draggedClient && draggedClient.kanbanStage !== newStage) {
      moveClient(draggedClient.id, newStage)
    }
    setDraggedClient(null)
  }

  // Calcular estatísticas
  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.kanbanStage === KanbanStage.ACTIVE).length
  const completedClients = clients.filter((c) => c.kanbanStage === KanbanStage.COMPLETED).length
  const conversionRate = totalClients > 0 ? ((completedClients / totalClients) * 100).toFixed(1) : "0"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM - Funil de Clientes</h1>
          <p className="text-muted-foreground">Gerencie o funil de vendas e acompanhamento de clientes</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar clientes..."
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">No funil de vendas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">Em acompanhamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objetivos Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedClients}</div>
            <p className="text-xs text-muted-foreground">Metas alcançadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Lead para concluído</p>
          </CardContent>
        </Card>
      </div>

      {/* Board Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 min-h-[600px]">
        {CRM_STAGES.map((stage) => {
          const stageClients = filteredClientsByStage[stage.id] || []
          const StageIcon = stage.icon

          return (
            <div
              key={stage.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Header da coluna */}
              <div className={`${stage.headerColor} text-white p-4 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StageIcon className="h-5 w-5" />
                    <h3 className="font-semibold">{stage.name}</h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {stageClients.length}
                  </Badge>
                </div>
                <p className="text-sm text-white/80 mt-1">{stage.description}</p>
              </div>

              {/* Cards dos clientes */}
              <div className={`${stage.color} flex-1 p-4 rounded-b-lg space-y-3 min-h-[500px]`}>
                {stageClients.map((client) => (
                  <Card
                    key={client.id}
                    className="cursor-move hover:shadow-md transition-shadow bg-white"
                    draggable
                    onDragStart={() => handleDragStart(client as CRMClient)}
                    onClick={() => {
                      setSelectedClient(client as CRMClient)
                      setIsClientDialogOpen(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage
                              src={
                                client.avatar ||
                                (client.gender === "M" ? "/man-avatar.png" : "/diverse-woman-avatar.png")
                              }
                              alt={client.name}
                            />
                            <AvatarFallback>
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate leading-tight">{client.name}</h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{client.phone}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedClient(client as CRMClient)
                                setIsClientDialogOpen(true)
                              }}
                            >
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {CRM_STAGES.filter((s) => s.id !== client.kanbanStage).map((targetStage) => (
                              <DropdownMenuItem
                                key={targetStage.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveClient(client.id, targetStage.id)
                                }}
                              >
                                Mover para {targetStage.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Informações adicionais */}
                      <div className="mt-3 space-y-2">
                        {(Array.isArray((client as any).goals) ? (client as any).goals.length : 0) > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <Target className="h-3 w-3 text-primary" />
                            <span className="text-muted-foreground">
                              {Array.isArray((client as any).goals) ? (client as any).goals.length : 0} objetivo
                              {(Array.isArray((client as any).goals) ? (client as any).goals.length : 0) > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Criado em {new Date(client.createdDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      {/* Peso atual vs meta */}
                      {client.currentWeight && client.targetWeight && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Peso atual:</span>
                            <span className="font-bold">{client.currentWeight}kg</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Meta:</span>
                            <span className="font-bold">{client.targetWeight}kg</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    (Math.abs(client.currentWeight - client.targetWeight) /
                                      Math.abs(client.currentWeight - client.targetWeight)) *
                                      100 || 0,
                                  ),
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {stageClients.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <StageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum cliente neste estágio</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de detalhes do cliente */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>Informações detalhadas e histórico do cliente no CRM</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={
                      selectedClient.avatar ||
                      (selectedClient.gender === "M" ? "/man-avatar.png" : "/diverse-woman-avatar.png")
                    }
                    alt={selectedClient.name}
                  />
                  <AvatarFallback>
                    {selectedClient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedClient.name}</h3>
                  <p className="text-muted-foreground">{selectedClient.email}</p>
                  <p className="text-muted-foreground">{selectedClient.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Estágio Atual</Label>
                  <Badge className="mt-1">{getKanbanStageLabel((selectedClient as any)?.kanbanStage ?? 0)}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Objetivos</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Array.isArray((selectedClient as any).goals) ? (selectedClient as any).goals.length : 0} objetivo
                    {(Array.isArray((selectedClient as any).goals) ? (selectedClient as any).goals.length : 0) > 1
                      ? "s"
                      : ""}{" "}
                    definido
                    {(Array.isArray((selectedClient as any).goals) ? (selectedClient as any).goals.length : 0) > 1
                      ? "s"
                      : ""}
                  </p>
                </div>
              </div>

              {selectedClient.currentWeight && selectedClient.targetWeight && (
                <div>
                  <Label className="text-sm font-medium">Progresso de Peso</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Peso atual: {selectedClient.currentWeight}kg</span>
                      <span>Meta: {selectedClient.targetWeight}kg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              (Math.abs(selectedClient.currentWeight - selectedClient.targetWeight) /
                                Math.abs(selectedClient.currentWeight - selectedClient.targetWeight)) *
                                100 || 0,
                            ),
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Mover para Estágio</Label>
                <Select
                  value={((selectedClient as any)?.kanbanStage ?? 0).toString()}
                  onValueChange={(value) => {
                    const newStage = Number.parseInt(value) as KanbanStage
                    selectedClient?.id != null && moveClient(selectedClient.id, newStage)
                    setSelectedClient({ ...selectedClient, kanbanStage: newStage })
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRM_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id.toString()}>
                        {stage.name} - {stage.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Notas</Label>
                <Textarea
                  placeholder="Adicione notas sobre o cliente..."
                  className="mt-1"
                  value={selectedClient.notes || ""}
                  onChange={(e) => setSelectedClient({ ...selectedClient, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>
              Fechar
            </Button>
            <Button className="bg-primary hover:bg-primary/90">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
