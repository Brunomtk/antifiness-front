"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dumbbell,
  Play,
  Clock,
  Target,
  RefreshCw,
  AlertCircle,
  Star,
  Award,
  TrendingUp,
  History,
  Calendar,
  Zap,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useClientWorkout } from "@/hooks/use-client-workout"
import { getWorkoutTypeLabel, getWorkoutDifficultyLabel, getWorkoutStatusLabel } from "@/types/workout"

export default function ClientWorkout() {
  const router = useRouter()
  const isMobile = useMobile()
  const { workouts, workoutHistory, stats, loading, error, refreshAll } = useClientWorkout()

  if (loading.workouts) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-3 md:p-6">
          <div className="mb-4 md:mb-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <div className="grid grid-cols-3 gap-2 md:hidden">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error.workouts || workouts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-3 md:p-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 md:text-3xl">
              {isMobile ? "Meus Treinos" : "Meus Treinos"}
            </h1>
            <p className="text-xs text-gray-600 md:text-base">Acompanhe seus exercícios e progresso</p>
          </div>

          <Alert className="max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {error.workouts || "Você ainda não possui treinos ativos. Entre em contato com seu personal trainer."}
              </span>
              <Button variant="outline" size="sm" onClick={refreshAll} className="ml-4 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="p-3 md:p-6">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 md:text-3xl">
                {isMobile ? "Meus Treinos" : "Meus Treinos"}
              </h1>
              <p className="text-xs text-gray-600 md:text-base">Acompanhe seus exercícios e progresso</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshAll} className="h-8 w-8 p-0 bg-transparent">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Mobile */}
          {stats && (
            <div className="grid grid-cols-3 gap-2 md:hidden">
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-[#df0e67]">{stats.totalWorkouts}</div>
                <div className="text-xs text-gray-500">treinos</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-blue-600">{stats.completedWorkouts}</div>
                <div className="text-xs text-gray-500">concluídos</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-green-600">{stats.averageRating?.toFixed(1) || "0"}</div>
                <div className="text-xs text-gray-500">avaliação</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Stats Desktop */}
            {!isMobile && stats && (
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#df0e67]/10">
                    <Target className="h-5 w-5 text-[#df0e67]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-lg font-bold">{stats.totalWorkouts}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Concluídos</p>
                    <p className="text-lg font-bold">{stats.completedWorkouts}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avaliação</p>
                    <p className="text-lg font-bold">{stats.averageRating?.toFixed(1) || "0"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Progresso</p>
                    <p className="text-lg font-bold">
                      {Math.round(((stats?.completedWorkouts ?? 0) / ((stats?.totalWorkouts ?? 0) || 1)) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Workouts List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-[#df0e67]" />
                  Treinos Disponíveis
                </h2>
              </div>

              {workouts.map((workout) => (
                <Card
                  key={workout.id}
                  className="workout-card-shadow border-0 hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{workout.name}</h3>
                          <Badge
                            variant="outline"
                            className={
                              workout.status === 1
                                ? "border-green-500 bg-green-50 text-green-700"
                                : "border-gray-500 bg-gray-50 text-gray-700"
                            }
                          >
                            {getWorkoutStatusLabel(workout.status ?? 0)}
                          </Badge>
                        </div>

                        <p className="text-gray-600 text-sm mb-3">{workout.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{getWorkoutTypeLabel(workout.type ?? 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            <span>{getWorkoutDifficultyLabel(workout.difficulty ?? 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-4 w-4" />
                            <span>{workout.exercises?.length || 0} exercícios</span>
                          </div>
                          {workout.estimatedDuration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{workout.estimatedDuration} min</span>
                            </div>
                          )}
                        </div>

                        {/* Exercise Preview */}
                        {workout.exercises && workout.exercises.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Exercícios:</h4>
                            <div className="space-y-1">
                              {workout.exercises.slice(0, 3).map((exercise, index) => (
                                <div
                                  key={exercise.exerciseId}
                                  className="text-sm text-gray-600 flex items-center gap-2"
                                >
                                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </span>
                                  <span>{exercise.exerciseName || `Exercício ${exercise.exerciseId}`}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>
                                    {exercise.sets}x{exercise.reps}
                                  </span>
                                  {exercise.weight && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span>{exercise.weight}kg</span>
                                    </>
                                  )}
                                </div>
                              ))}
                              {workout.exercises.length > 3 && (
                                <div className="text-sm text-gray-500">
                                  +{workout.exercises.length - 3} exercícios adicionais
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`/client/workout/active?id=${workout.id}`)}
                        className="flex-1 workout-gradient hover:opacity-90 text-white"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Treino
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Recent History */}
            {workoutHistory && workoutHistory.length > 0 && (
              <Card className="workout-card-shadow border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Histórico Recente
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Últimos treinos realizados</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {workoutHistory.slice(0, 5).map((h, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{h.workoutName}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(h.date).toLocaleDateString("pt-BR")}</span>
                            {h.actualDuration && (
                              <>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{Math.floor(h.actualDuration / 60)}min</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs font-medium">{h.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            {stats && (
              <Card className="workout-card-shadow border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Estatísticas</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Seu desempenho geral</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taxa de conclusão</span>
                      <span className="font-bold text-green-600">
                        {Math.round(((stats?.completedWorkouts ?? 0) / ((stats?.totalWorkouts ?? 0) || 1)) * 100)}%
                      </span>
                    </div>

                    {stats.totalDuration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tempo total</span>
                        <span className="font-bold text-blue-600">
                          {Math.floor(stats.totalDuration / 3600)}h {Math.floor((stats.totalDuration % 3600) / 60)}min
                        </span>
                      </div>
                    )}

                    {stats.totalCalories && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Calorias queimadas</span>
                        <span className="font-bold text-orange-600">{stats.totalCalories}</span>
                      </div>
                    )}

                    {stats.personalRecords && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Recordes pessoais</span>
                        <span className="font-bold text-purple-600">{stats.personalRecords}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
