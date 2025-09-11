"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  TrendingUp,
  Target,
  Award,
  MessageSquare,
  ChevronRight,
  Apple,
  Dumbbell,
  Heart,
  Zap,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useUser } from "@/hooks/use-user"
import { useClientDashboard } from "@/hooks/use-client-dashboard"

export default function ClientDashboard() {
  const isMobile = useMobile()
  const { currentUser } = useUser()
  const { stats, recentActivities, upcomingTasks, clientData, isLoading, error, refetch } = useClientDashboard()
  const [currentDate] = useState(new Date())
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
        <div className="p-3 md:p-6">
          {/* Header Skeleton */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <Skeleton className="h-6 md:h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              {!isMobile && <Skeleton className="h-10 w-10 rounded-full" />}
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="mb-4 md:mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-3 md:p-4">
                  <div className="text-center md:flex md:items-center md:justify-between md:text-left">
                    <div className="flex-1">
                      <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
                        <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full mb-1 md:mb-0 md:mr-3" />
                      </div>
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-6 w-12 mb-1" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4 md:space-y-6 md:grid md:gap-6 md:grid-cols-3">
            <div className="space-y-4 md:space-y-6 md:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardHeader className="pb-3 md:pb-6">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4 md:space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardHeader className="pb-3 md:pb-6">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
        <div className="p-3 md:p-6">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div className="flex items-center justify-between">
                <span>{error || "Não foi possível carregar os dados do dashboard."}</span>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2 bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Tentar novamente
                </Button>
              </div>

              {/* Debug Info */}
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="text-xs text-gray-500 p-0 h-auto"
                >
                  <Info className="h-3 w-3 mr-1" />
                  {showDebugInfo ? "Ocultar" : "Mostrar"} informações de debug
                </Button>

                {showDebugInfo && (
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 space-y-1">
                    <div>
                      <strong>User ID:</strong> {currentUser?.id || "N/A"}
                    </div>
                    <div>
                      <strong>Client ID:</strong> {currentUser?.clientId || "N/A"}
                    </div>
                    <div>
                      <strong>User Type:</strong> {currentUser?.userType || "N/A"}
                    </div>
                    <div>
                      <strong>User Status:</strong> {currentUser?.userStatus || "N/A"}
                    </div>
                    <div>
                      <strong>Error:</strong> {error || "N/A"}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dados não disponíveis</h3>
            <p className="text-gray-500 mb-4">
              Não foi possível carregar os dados do dashboard. Verifique sua conexão e tente novamente.
            </p>
            <Button onClick={handleRefresh} className="bg-[#df0e67] hover:bg-[#c00c5a]">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar dados
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const displayName = clientData?.name || currentUser?.name || "Cliente"

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      <div className="p-3 md:p-6">
        {/* Header Mobile Otimizado */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900">Olá, {displayName}! 👋</h1>
              <p className="text-xs md:text-base text-gray-600 mt-1">
                {isMobile
                  ? currentDate.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
                  : currentDate.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 w-8 p-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards Mobile First */}
        <div className="mb-4 md:mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-center md:flex md:items-center md:justify-between md:text-left">
                <div className="flex-1">
                  <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-green-100 mb-1 md:mb-0 md:mr-3">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Peso Atual</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats.currentWeight > 0 ? `${stats.currentWeight}kg` : "N/A"}
                  </p>
                  <p className="text-xs text-green-600">
                    {stats.weightLoss > 0 ? `-${stats.weightLoss.toFixed(1)}kg` : "Sem dados"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-center md:flex md:items-center md:justify-between md:text-left">
                <div className="flex-1">
                  <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-blue-100 mb-1 md:mb-0 md:mr-3">
                      <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Meta</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats.goalWeight > 0 ? `${stats.goalWeight}kg` : "N/A"}
                  </p>
                  <p className="text-xs text-blue-600">
                    {stats.goalWeight > 0 && stats.currentWeight > 0
                      ? `${Math.max(0, stats.currentWeight - stats.goalWeight).toFixed(1)}kg restantes`
                      : "Sem meta definida"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-center md:flex md:items-center md:justify-between md:text-left">
                <div className="flex-1">
                  <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-purple-100 mb-1 md:mb-0 md:mr-3">
                      <Award className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Aderência</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{Math.round(stats.adherence)}%</p>
                  <p className="text-xs text-purple-600">
                    {stats.adherence >= 90
                      ? "Excelente!"
                      : stats.adherence >= 75
                        ? "Muito bom!"
                        : stats.adherence > 0
                          ? "Continue assim!"
                          : "Sem atividades"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-center md:flex md:items-center md:justify-between md:text-left">
                <div className="flex-1">
                  <div className="flex items-center justify-center md:justify-start mb-2 md:mb-0">
                    <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-orange-100 mb-1 md:mb-0 md:mr-3">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">Dias Ativos</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats.daysActive}/{stats.totalDays}
                  </p>
                  <p className="text-xs text-orange-600">Este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas Mobile */}
        {isMobile && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-16 bg-[#df0e67] hover:bg-[#c00c5a] flex-col gap-1">
                <Apple className="h-5 w-5" />
                <span className="text-xs">Registrar Refeição</span>
              </Button>
              <Button variant="outline" className="h-16 bg-white flex-col gap-1">
                <Dumbbell className="h-5 w-5" />
                <span className="text-xs">Iniciar Treino</span>
              </Button>
              <Button variant="outline" className="h-16 bg-white flex-col gap-1">
                <Heart className="h-5 w-5" />
                <span className="text-xs">Registrar Peso</span>
              </Button>
              <Button variant="outline" className="h-16 bg-white flex-col gap-1">
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">Mensagem</span>
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4 md:space-y-6 md:grid md:gap-6 md:grid-cols-3">
          {/* Progress Section */}
          <div className="space-y-4 md:space-y-6 md:col-span-2">
            {/* Weight Progress Mobile Otimizado */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg">Progresso de Peso</CardTitle>
                <CardDescription className="text-sm">Sua jornada rumo ao objetivo</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {stats.currentWeight > 0 && stats.goalWeight > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span>Inicial: {stats.startWeight}kg</span>
                      <span>Meta: {stats.goalWeight}kg</span>
                    </div>
                    <Progress value={Math.min(stats.progressPercentage, 100)} className="h-2 md:h-3" />
                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
                      <span>{stats.progressPercentage.toFixed(1)}% concluído</span>
                      <span>{Math.max(0, stats.currentWeight - stats.goalWeight).toFixed(1)}kg restantes</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Configure seu peso atual e meta para ver o progresso</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Progress Mobile */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg">Progresso Semanal</CardTitle>
                <CardDescription className="text-sm">Sua consistência diária</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {stats.weeklyProgress.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs font-medium text-gray-600 mb-1 md:mb-2">{day.day}</div>
                      <div
                        className={`h-8 md:h-12 w-full rounded-lg flex items-center justify-center transition-colors ${
                          day.completed ? "bg-[#df0e67] text-white" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {day.completed ? (
                          <span className="text-xs font-bold">{day.adherence}%</span>
                        ) : (
                          <span className="text-xs">-</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities Mobile */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg">Atividades Recentes</CardTitle>
                <CardDescription className="text-sm">Suas últimas ações</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 md:space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => {
                      const IconComponent =
                        activity.icon === "Apple" ? Apple : activity.icon === "Dumbbell" ? Dumbbell : MessageSquare
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center gap-3 p-2 md:p-0 rounded-lg md:rounded-none hover:bg-gray-50 md:hover:bg-transparent transition-colors"
                        >
                          <div
                            className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full ${activity.bgColor}`}
                          >
                            <IconComponent className={`h-4 w-4 md:h-5 md:w-5 ${activity.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma atividade recente</p>
                      <p className="text-xs mt-1">Comece registrando uma refeição ou treino</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Mobile/Desktop */}
          <div className="space-y-4 md:space-y-6">
            {/* Quick Actions Desktop */}
            {!isMobile && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-[#df0e67] hover:bg-[#c00c5a]">
                    <Apple className="mr-2 h-4 w-4" />
                    Registrar Refeição
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Iniciar Treino
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Heart className="mr-2 h-4 w-4" />
                    Registrar Peso
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Falar com Nutricionista
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Tasks */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg">Próximas Atividades</CardTitle>
                <CardDescription className="text-sm">Sua agenda para hoje</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 md:space-y-3">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task) => {
                      const IconComponent = task.icon === "Apple" ? Apple : Dumbbell
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 rounded-lg border p-2 md:p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#df0e67]/10">
                            <IconComponent className="h-4 w-4 text-[#df0e67]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                            <p className="text-xs text-gray-500">{task.subtitle}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-[#df0e67]">{task.time}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma atividade programada</p>
                      <p className="text-xs mt-1">Suas próximas refeições e treinos aparecerão aqui</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Motivation Card */}
            {stats.progressPercentage > 0 && (
              <Card className="border-none bg-gradient-to-br from-[#df0e67]/10 to-[#df0e67]/5 shadow-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="mb-3 md:mb-4 flex justify-center">
                    <div className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#df0e67]/20">
                      <Zap className="h-6 w-6 md:h-8 md:w-8 text-[#df0e67]" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-sm md:text-base font-semibold text-gray-900">Continue assim!</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Você está indo muito bem! Já perdeu {stats.weightLoss.toFixed(1)}kg e está{" "}
                    {stats.progressPercentage.toFixed(0)}% mais próximo do seu objetivo.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
