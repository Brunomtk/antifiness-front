"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Star,
  Download,
  Calendar,
  Users,
  BookOpen,
  Utensils,
  MessageSquare,
  UserCheck,
  Dumbbell,
  RefreshCw,
  AlertCircle,
  Activity,
  Zap,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { useStats } from "@/hooks/use-stats"
import type { StatsFilters } from "@/types/stats"

export default function AdminReports() {
  const { stats, loading, error, fetchStats } = useStats()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(2024, 0, 1), to: new Date() })
  const [selectedPeriod, setSelectedPeriod] = useState("3months")
  const [filters, setFilters] = useState<StatsFilters>({})

  const handleRefresh = () => {
    fetchStats(filters)
  }

  const handleExport = () => {
    if (!stats) return

    const dataToExport = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      dateRange,
      stats,
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${format(new Date(), "yyyy-MM-dd-HH-mm")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios e Analytics</h1>
            <p className="text-indigo-100">Dashboard completo com estatísticas em tempo real do seu negócio</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="1year">Último ano</SelectItem>
                <SelectItem value="custom">Período customizado</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-60 justify-start text-left font-normal bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecionar período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range as DateRange | undefined)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button onClick={handleExport} disabled={!stats} className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Clientes</p>
                <p className="text-2xl font-bold">{stats?.clients.totalClients || 0}</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center text-xs text-blue-100 mt-2">
              {stats?.clients.monthlyGrowthPercentage && stats.clients.monthlyGrowthPercentage > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {stats?.clients.monthlyGrowthPercentage?.toFixed(1) || 0}% crescimento mensal
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Receita de Cursos</p>
                <p className="text-2xl font-bold">R$ {stats?.courses.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center text-xs text-green-100 mt-2">
              <BookOpen className="mr-1 h-3 w-3" />
              {stats?.courses.totalEnrollments || 0} matrículas
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Taxa de Retenção</p>
                <p className="text-2xl font-bold">{stats?.clients.retentionRate || 0}%</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Target className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center text-xs text-orange-100 mt-2">
              <Activity className="mr-1 h-3 w-3" />
              {stats?.clients.activeClients || 0} clientes ativos
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Satisfação Média</p>
                <p className="text-2xl font-bold">{stats?.feedbacks.averageRating?.toFixed(1) || 0}/10</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center text-xs text-purple-100 mt-2">
              <MessageSquare className="mr-1 h-3 w-3" />
              {stats?.feedbacks.totalFeedbacks || 0} avaliações
            </div>
          </div>
        </div>
      </div>

      {/* Relatórios Detalhados */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="diets">Dietas</TabsTrigger>
          <TabsTrigger value="workouts">Treinos</TabsTrigger>
          <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Resumo de Usuários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Usuários do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Usuários</span>
                      <span className="font-bold">{stats?.users.totalUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Administradores</span>
                      <span className="font-bold">{stats?.users.totalAdmins || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clientes</span>
                      <span className="font-bold">{stats?.users.totalClients || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usuários Ativos</span>
                      <span className="font-bold text-green-600">{stats?.users.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crescimento</span>
                      <span className="font-bold text-blue-600">{stats?.users.growthPercentage || 0}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo de Dietas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Status das Dietas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total de Dietas</span>
                      <span className="font-bold">{stats?.diets.totalDiets || 0}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ativas</span>
                        <span>{stats?.diets.activeDiets || 0}</span>
                      </div>
                      <Progress value={stats?.diets.activeDietsPercentage || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Concluídas</span>
                        <span>{stats?.diets.completedDiets || 0}</span>
                      </div>
                      <Progress value={stats?.diets.completedDietsPercentage || 0} className="h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span>Média de Calorias</span>
                      <span className="font-bold">{stats?.diets.averageCaloriesPerDiet || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo de Treinos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Treinos e Exercícios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Exercícios</span>
                      <span className="font-bold">{stats?.workouts.totalExercises || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exercícios Ativos</span>
                      <span className="font-bold text-green-600">{stats?.workouts.activeExercises || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Treinos</span>
                      <span className="font-bold">{stats?.workouts.totalWorkouts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Conclusão</span>
                      <span className="font-bold">{stats?.workouts.completionRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recordes Pessoais</span>
                      <span className="font-bold text-yellow-600">{stats?.workouts.personalRecords || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Clientes</CardTitle>
                <CardDescription>Status atual dos clientes cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Clientes Ativos</span>
                        <span className="font-bold text-green-600">{stats?.clients.activeClients || 0}</span>
                      </div>
                      <Progress
                        value={
                          stats?.clients.totalClients
                            ? (stats.clients.activeClients / stats.clients.totalClients) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Clientes Inativos</span>
                        <span className="font-bold text-red-600">{stats?.clients.inactiveClients || 0}</span>
                      </div>
                      <Progress
                        value={
                          stats?.clients.totalClients
                            ? (stats.clients.inactiveClients / stats.clients.totalClients) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Clientes Pausados</span>
                        <span className="font-bold text-yellow-600">{stats?.clients.pausedClients || 0}</span>
                      </div>
                      <Progress
                        value={
                          stats?.clients.totalClients
                            ? (stats.clients.pausedClients / stats.clients.totalClients) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>Indicadores de sucesso dos clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Perda de Peso Média</span>
                      <Badge variant="secondary">{stats?.clients.averageWeightLoss || 0}kg</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Metas Alcançadas</span>
                      <Badge variant="secondary">{stats?.clients.clientsWithGoalsAchieved || 0} clientes</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Com Nutricionista</span>
                      <Badge variant="secondary">{stats?.clients.clientsWithNutritionist || 0} clientes</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Com Plano Ativo</span>
                      <Badge variant="secondary">{stats?.clients.clientsWithActivePlan || 0} clientes</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Novos Este Mês</span>
                      <Badge variant="outline">{stats?.clients.newClientsThisMonth || 0} clientes</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Cursos</CardTitle>
                <CardDescription>Distribuição dos cursos por status</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Cursos Publicados</span>
                      <Badge variant="default">{stats?.courses.publishedCourses || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rascunhos</span>
                      <Badge variant="secondary">{stats?.courses.draftCourses || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total de Matrículas</span>
                      <Badge variant="outline">{stats?.courses.totalEnrollments || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Matrículas Ativas</span>
                      <Badge variant="default">{stats?.courses.activeEnrollments || 0}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias Populares</CardTitle>
                <CardDescription>Distribuição dos cursos por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats?.courses.popularCategories?.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category.category}</span>
                          <span>
                            {category.count} cursos ({category.percentage}%)
                          </span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    )) || <p className="text-muted-foreground text-sm">Nenhuma categoria encontrada</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Dietas</CardTitle>
                <CardDescription>Métricas gerais das dietas cadastradas</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats?.diets.totalDiets || 0}</div>
                        <div className="text-sm text-muted-foreground">Total de Dietas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats?.diets.activeDiets || 0}</div>
                        <div className="text-sm text-muted-foreground">Dietas Ativas</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats?.diets.completedDiets || 0}</div>
                        <div className="text-sm text-muted-foreground">Concluídas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats?.diets.pausedDiets || 0}</div>
                        <div className="text-sm text-muted-foreground">Pausadas</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Nutricionais</CardTitle>
                <CardDescription>Dados médios das dietas</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Calorias Médias
                      </span>
                      <Badge variant="secondary">{stats?.diets.averageCaloriesPerDiet || 0} kcal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Refeições por Dieta
                      </span>
                      <Badge variant="secondary">{stats?.diets.averageMealsPerDiet || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Taxa de Conclusão
                      </span>
                      <Badge variant="secondary">{stats?.diets.averageCompletionRate || 0}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Nível de Energia
                      </span>
                      <Badge variant="secondary">{stats?.diets.averageEnergyLevel || 0}/10</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Treinos</CardTitle>
                <CardDescription>Métricas gerais dos treinos e exercícios</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats?.workouts.totalWorkouts || 0}</div>
                        <div className="text-sm text-muted-foreground">Total de Treinos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats?.workouts.completedWorkouts || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Concluídos</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats?.workouts.totalExercises || 0}</div>
                        <div className="text-sm text-muted-foreground">Exercícios</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats?.workouts.personalRecords || 0}</div>
                        <div className="text-sm text-muted-foreground">Recordes</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Treino</CardTitle>
                <CardDescription>Distribuição dos treinos por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats?.workouts.workoutsByType?.map((type) => (
                      <div key={type.type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{type.type}</span>
                          <span>
                            {type.count} treinos ({type.percentage}%)
                          </span>
                        </div>
                        <Progress value={type.percentage} className="h-2" />
                      </div>
                    )) || <p className="text-muted-foreground text-sm">Nenhum tipo de treino encontrado</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedbacks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Feedbacks</CardTitle>
                <CardDescription>Distribuição dos feedbacks por status</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(stats?.feedbacks.feedbacksByStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span>{status}</span>
                        <Badge variant={status === "Pending" ? "destructive" : "default"}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedbacks por Categoria</CardTitle>
                <CardDescription>Distribuição dos feedbacks por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(stats?.feedbacks.feedbacksByCategory || {}).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span>{category}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Feedback</CardTitle>
              <CardDescription>Distribuição dos feedbacks por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(stats?.feedbacks.feedbacksByType || {}).map(([type, count]) => (
                    <div key={type} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{count}</div>
                      <div className="text-sm text-muted-foreground">{type}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
