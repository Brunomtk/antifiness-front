"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { clientService } from "@/services/client-service"
import type { Client } from "@/types/client"
import { getKanbanStageLabel } from "@/types/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Target,
  Activity,
  Weight,
  Ruler,
  Edit3,
  TrendingUp,
  Award,
  FileText,
  Utensils,
  Dumbbell,
} from "lucide-react"

const ClientForm = dynamic(() => import("@/components/client/ClientForm"), { ssr: false })
import ClientOverview from "@/components/client/ClientOverview"
import DietSection from "@/components/client/DietSection"
import WorkoutSection from "@/components/client/WorkoutSection"
import ProgressSection from "@/components/client/ProgressSection"
import AchievementsSection from "@/components/client/AchievementsSection"

export default function ClientDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params?.id)
  const [loading, setLoading] = React.useState(true)
  const [client, setClient] = React.useState<Client | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState<string>("overview")

  React.useEffect(() => {
    const run = async () => {
      try {
        const data = await clientService.getById(id)
        setClient(data)
      } catch (error: any) {
        const message = error?.response?.data || error?.message || "Erro ao carregar cliente"
        toast({ title: "Falha", description: String(message) })
      } finally {
        setLoading(false)
      }
    }
    if (id) run()
  }, [id])

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#edit") {
      setEditOpen(true)
    }
  }, [])

  const getActivityLevelLabel = (level: number) => {
    const labels = ["Sedentária", "Leve", "Moderada", "Ativa", "Muito Ativa"]
    return labels[level] || "Não definido"
  }

  const getGoalTypeLabel = (goal: number) => {
    const labels = ["Perda de Peso", "Ganho de Peso", "Ganho de Massa", "Manutenção", "Saúde", "Performance"]
    return labels[goal] || "Não definido"
  }

  const getKanbanStageColor = (stage: number) => {
    const colors = {
      0: "bg-amber-500", // Lead
      1: "bg-blue-500", // Prospect
      2: "bg-green-500", // Active
      3: "bg-gray-500", // Inactive
      4: "bg-purple-500", // Completed
    }
    return colors[stage as keyof typeof colors] || "bg-gray-500"
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Cliente não encontrado</h2>
          <p className="text-gray-600 mt-2">O cliente solicitado não existe ou foi removido.</p>
          <Button onClick={() => router.push("/admin/clients")} className="mt-4">
            Voltar para Clientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Client Info */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                <AvatarImage src={client.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  {client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
                  <Badge className={`${getKanbanStageColor((client as any)?.kanbanStage || 0)} text-white border-0`}>
                    {getKanbanStageLabel((client as any)?.kanbanStage || 0)}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {client.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.createdDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Cliente desde {new Date(client.createdDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/admin/diets`)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Nova Dieta
              </Button>
              <Button
                onClick={() => router.push(`/admin/workouts/create?clientId=${id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Novo Treino
              </Button>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                  </DialogHeader>
                  <ClientForm mode="edit" initial={client} clientId={id} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Peso Atual</p>
                  <p className="text-2xl font-bold">{client.currentWeight || "--"} kg</p>
                </div>
                <Weight className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Meta</p>
                  <p className="text-2xl font-bold">{client.targetWeight || "--"} kg</p>
                </div>
                <Target className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Altura</p>
                  <p className="text-2xl font-bold">{client.height || "--"} cm</p>
                </div>
                <Ruler className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Atividade</p>
                  <p className="text-lg font-bold">{getActivityLevelLabel((client as any)?.activityLevel || 0)}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "overview", name: "Visão Geral", icon: User },
                { id: "diets", name: "Dietas", icon: Utensils },
                { id: "workouts", name: "Treinos", icon: Dumbbell },
                { id: "progress", name: "Progresso", icon: TrendingUp },
                { id: "achievements", name: "Conquistas", icon: Award },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`${
                      activeSection === tab.id
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 rounded-t-lg transition-all duration-200`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ClientOverview clientId={id} />
                  </div>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Informações Pessoais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Gênero:</span>
                            <p className="font-medium">{(client as any)?.gender || "Não informado"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Nascimento:</span>
                            <p className="font-medium">
                              {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "Não informado"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Objetivo:</span>
                            <p className="font-medium">{getGoalTypeLabel((client as any)?.goalType || 0)}</p>
                          </div>
                          {(client as any)?.notes && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Observações:</span>
                              <p className="font-medium text-gray-700">{(client as any).notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "diets" && (
              <div>
                <DietSection clientId={id} />
              </div>
            )}

            {activeSection === "workouts" && (
              <div>
                <WorkoutSection clientId={id} />
              </div>
            )}

            {activeSection === "progress" && (
              <div>
                <ProgressSection clientId={id} />
              </div>
            )}

            {activeSection === "achievements" && (
              <div>
                <AchievementsSection clientId={id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
