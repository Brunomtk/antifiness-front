"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Dumbbell,
  Edit3,
  Clock,
  Flame,
  Target,
  TrendingUp,
  User,
  Calendar,
  Eye,
  Activity,
} from "lucide-react"
import { workoutService } from "@/services/workout-service"
import { clientService } from "@/services/client-service"
import { companyService } from "@/services/company-service"
import type { Workout } from "@/types/workout"
import { toast } from "@/components/ui/use-toast"

const WorkoutForm = dynamic(() => import("@/components/workout/WorkoutForm"), { ssr: false })
const WorkoutProgress = dynamic(() => import("@/components/workout/WorkoutProgress"), { ssr: false })

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = Number(params?.id)
  const [loading, setLoading] = React.useState(true)
  const [workout, setWorkout] = React.useState<Workout | null>(null)
  const [clientName, setClientName] = React.useState<string>("")
  const [companyName, setCompanyName] = React.useState<string>("")
  const [editOpen, setEditOpen] = React.useState(false)

  const load = async () => {
    try {
      const data = await workoutService.getById(id)
      setWorkout(data)

      if (data.clientId) {
        try {
          const client = await clientService.getById(data.clientId)
          setClientName(client.name || "")
        } catch (err) {
          console.error("Error loading client:", err)
        }
      }

      if (data.empresaId) {
        try {
          const companies = await companyService.getAll()
          const company = companies.find((c) => c.id === data.empresaId)
          setCompanyName(company?.name || "")
        } catch (err) {
          console.error("Error loading company:", err)
        }
      }
    } catch (err: any) {
      toast({ title: "Erro ao carregar treino", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (id) load()
  }, [id])

  const getWorkoutStatusColor = (status: number) => {
    const colors = {
      0: "bg-gray-500", // Rascunho
      1: "bg-green-500", // Ativo
      2: "bg-blue-500", // Concluído
      3: "bg-red-500", // Arquivado
    }
    return colors[status as keyof typeof colors] || "bg-gray-500"
  }

  const getWorkoutStatusLabel = (status: number) => {
    const labels = { 0: "Rascunho", 1: "Ativo", 2: "Concluído", 3: "Arquivado" }
    return labels[status as keyof typeof labels] || "—"
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-48 bg-white/20 animate-pulse rounded" />
                <div className="h-4 w-64 bg-white/20 animate-pulse rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-20 bg-white/20 animate-pulse rounded" />
              <div className="h-10 w-24 bg-white/20 animate-pulse rounded" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>

        <div className="h-96 bg-gray-200 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight">Treino não encontrado</h1>
            <p className="text-orange-100">O treino solicitado não existe ou foi removido.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Treino não encontrado</h2>
            <p className="text-gray-600 mb-4">O treino solicitado não existe ou foi removido.</p>
            <Button onClick={() => router.push("/admin/workouts")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Treinos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-white/20 shadow-lg">
              <AvatarImage src={workout.clientAvatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                <Dumbbell className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{workout.name}</h1>
                <Badge className={`${getWorkoutStatusColor(workout.status)} text-white border-0`}>
                  {getWorkoutStatusLabel(workout.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-orange-100">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{clientName || workout.clientName || "Cliente não definido"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Criado em {new Date(workout.createdDate || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{workout.exercises?.length || 0} exercícios</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.back()} variant="secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Treino</DialogTitle>
                </DialogHeader>
                <WorkoutForm mode="edit" initial={{ ...workout, companyName }} workoutId={id} />
              </DialogContent>
            </Dialog>
            <Button
              className="bg-white text-orange-700 hover:bg-orange-50"
              onClick={async () => {
                await workoutService.changeStatus(workout.id, workout.status === 1 ? 2 : 1)
                toast({ title: "Status alterado" })
                load()
              }}
            >
              Alterar Status
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Exercícios</p>
                <p className="text-2xl font-bold">{workout.exercises?.length || 0}</p>
                <p className="text-xs text-blue-200">Total programados</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Dumbbell className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Duração Estimada</p>
                <p className="text-2xl font-bold">{workout.estimatedDuration || 0}</p>
                <p className="text-xs text-green-200">minutos</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Calorias Estimadas</p>
                <p className="text-2xl font-bold">{workout.estimatedCalories || 0}</p>
                <p className="text-xs text-orange-200">kcal</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Flame className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Progresso</p>
                <p className="text-2xl font-bold">{workout.completionPercentage || 0}%</p>
                <p className="text-xs text-purple-200">Concluído</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-orange-600" />
            Detalhes do Treino
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Exercícios
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Progresso
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Informações do Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Nome:</span>
                        <span className="text-sm">{clientName || workout.clientName || "Não definido"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Empresa:</span>
                        <span className="text-sm">{companyName || "Não definido"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Detalhes do Treino
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Tipo:</span>
                        <span className="text-sm">{workout.type || "Não definido"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Dificuldade:</span>
                        <span className="text-sm">{workout.difficulty || "Não definido"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <Badge className={`${getWorkoutStatusColor(workout.status)} text-white border-0`}>
                          {getWorkoutStatusLabel(workout.status)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {workout.description && (
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        Descrição
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{workout.description}</p>
                    </CardContent>
                  </Card>
                )}

                {workout.notes && (
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-purple-600" />
                        Observações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{workout.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="exercises" className="mt-6">
              <WorkoutForm mode="edit" initial={{ ...workout, companyName }} workoutId={id} />
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <WorkoutProgress workout={workout} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
