"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useStats } from "@/hooks/use-stats"
import { useRouter } from "next/navigation"
import {
  Users,
  TrendingUp,
  UserCheck,
  Utensils,
  Dumbbell,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  MessageSquare,
  DollarSign,
  BookOpen,
  Star,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Target,
} from "lucide-react"

export default function AdminDashboard() {
  const { stats, loading, error, refreshStats } = useStats()
  const router = useRouter()

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bem-vindo ao seu painel de controle!</p>
          </div>
          <Button onClick={refreshStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Erro ao carregar dados: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Novo Cliente",
      description: "Cadastrar novo cliente",
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/clients",
    },
    {
      title: "Criar Dieta",
      description: "Nova dieta personalizada",
      icon: Utensils,
      color: "bg-green-500",
      href: "/admin/diets",
    },
    {
      title: "Novo Treino",
      description: "Criar plano de treino",
      icon: Dumbbell,
      color: "bg-purple-500",
      href: "/admin/workouts",
    },
    {
      title: "Novo Curso",
      description: "Adicionar curso educativo",
      icon: BookOpen,
      color: "bg-orange-500",
      href: "/admin/courses",
    },
    {
      title: "Ver Mensagens",
      description: "Mensagens dos clientes",
      icon: MessageSquare,
      color: "bg-pink-500",
      href: "/admin/messages",
    },
    {
      title: "Relatórios",
      description: "Análises detalhadas",
      icon: BarChart3,
      color: "bg-indigo-500",
      href: "/admin/reports",
    },
  ]

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-3 w-3 text-green-600" />
    if (value < 0) return <ArrowDownRight className="h-3 w-3 text-red-600" />
    return <ArrowUpRight className="h-3 w-3 text-gray-400" />
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo ao seu painel de controle!</p>
        </div>
        <Button onClick={refreshStats} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-[#df0e67]" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-gray-50 bg-transparent"
                onClick={() => router.push(action.href)}
              >
                <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.clients.totalClients || 0}</p>
                    <div
                      className={`flex items-center mt-2 text-xs ${getChangeColor(stats?.clients.monthlyGrowthPercentage || 0)}`}
                    >
                      {getChangeIcon(stats?.clients.monthlyGrowthPercentage || 0)}
                      <span>{stats?.clients.monthlyGrowthPercentage || 0}% este mês</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Retenção</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.clients.retentionRate || 0}%</p>
                    <div className="flex items-center mt-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Clientes ativos: {stats?.clients.activeClients || 0}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cursos Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.courses.publishedCourses || 0}</p>
                    <div className="flex items-center mt-2 text-xs text-purple-600">
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span>Total: {stats?.courses.totalCourses || 0} cursos</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      R$ {(stats?.courses.totalRevenue || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-[#df0e67]">
                      <DollarSign className="h-3 w-3 mr-1" />
                      <span>Matrículas: {stats?.courses.totalEnrollments || 0}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-pink-50">
                    <DollarSign className="h-6 w-6 text-[#df0e67]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diet & Workout Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Dietas</CardTitle>
                    <CardDescription>Status das dietas criadas</CardDescription>
                  </div>
                  <Utensils className="h-5 w-5 text-[#df0e67]" />
                </div>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total de Dietas</span>
                      <Badge variant="outline">{stats?.diets.totalDiets || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dietas Ativas</span>
                      <Badge className="bg-green-100 text-green-800">{stats?.diets.activeDiets || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                      <Badge className="bg-blue-100 text-blue-800">{stats?.diets.averageCompletionRate || 0}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Calorias Médias</span>
                      <Badge variant="outline">{stats?.diets.averageCaloriesPerDiet || 0}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Treinos</CardTitle>
                    <CardDescription>Estatísticas de exercícios</CardDescription>
                  </div>
                  <Dumbbell className="h-5 w-5 text-[#df0e67]" />
                </div>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total de Exercícios</span>
                      <Badge variant="outline">{stats?.workouts.totalExercises || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exercícios Ativos</span>
                      <Badge className="bg-green-100 text-green-800">{stats?.workouts.activeExercises || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total de Treinos</span>
                      <Badge className="bg-purple-100 text-purple-800">{stats?.workouts.totalWorkouts || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                      <Badge className="bg-blue-100 text-blue-800">{stats?.workouts.completionRate || 0}%</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Workout Types Distribution */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Distribuição de Tipos de Treino</CardTitle>
                  <CardDescription>Tipos mais utilizados</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-[#df0e67]" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-2 flex-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.workouts.workoutsByType?.map((type, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 w-20">{type.type}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#df0e67] to-[#b00950] h-2 rounded-full transition-all"
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12">{type.percentage}%</span>
                    </div>
                  )) || <p className="text-sm text-gray-500 text-center py-4">Nenhum dado disponível</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Stats */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuários do Sistema</CardTitle>
                  <CardDescription>Estatísticas de usuários</CardDescription>
                </div>
                <UserCheck className="h-5 w-5 text-[#df0e67]" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de Usuários</span>
                    <Badge variant="outline">{stats?.users.totalUsers || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Administradores</span>
                    <Badge className="bg-purple-100 text-purple-800">{stats?.users.totalAdmins || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usuários Ativos</span>
                    <Badge className="bg-green-100 text-green-800">{stats?.users.activeUsers || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Crescimento</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats?.users.growthPercentage || 0}%</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Stats */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Feedbacks</CardTitle>
                  <CardDescription>Avaliações dos clientes</CardDescription>
                </div>
                <MessageSquare className="h-5 w-5 text-[#df0e67]" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de Feedbacks</span>
                    <Badge variant="outline">{stats?.feedbacks.totalFeedbacks || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pendentes</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats?.feedbacks.pendingFeedbacks || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Resolvidos</span>
                    <Badge className="bg-green-100 text-green-800">{stats?.feedbacks.resolvedFeedbacks || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avaliação Média</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{(stats?.feedbacks.averageRating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Categories */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categorias Populares</CardTitle>
                  <CardDescription>Cursos mais procurados</CardDescription>
                </div>
                <PieChart className="h-5 w-5 text-[#df0e67]" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.courses.popularCategories?.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-[#df0e67]" />
                        <span className="text-sm text-gray-600">{category.category}</span>
                      </div>
                      <span className="text-sm font-medium">{category.percentage}%</span>
                    </div>
                  )) || <p className="text-sm text-gray-500 text-center py-4">Nenhuma categoria disponível</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
