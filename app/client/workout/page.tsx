"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Dumbbell,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Play,
  Target,
  RefreshCw,
  AlertCircle,
  Star,
  Award,
  TrendingUp,
  History,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useClientWorkout } from "@/hooks/use-client-workout"
import {
  getWorkoutTypeLabel,
  getWorkoutDifficultyLabel,
  getWorkoutStatusLabel,
  getWorkoutMoodLabel,
} from "@/types/workout"

export default function ClientWorkout() {
  const isMobile = useMobile()
  const {
    workouts,
    currentWorkout,
    progress,
    workoutHistory,
    stats,
    loading,
    error,
    loadWorkout,
    loadProgress,
    clearError,
    refreshAll,
  } = useClientWorkout()

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null)
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [workoutRating, setWorkoutRating] = useState(5)
  const [workoutMood, setWorkoutMood] = useState(1)
  const [energyLevel, setEnergyLevel] = useState(5)

  // Selecionar primeiro workout automaticamente
  useEffect(() => {
    if (workouts.length > 0 && !selectedWorkoutId) {
      const firstWorkout = workouts[0]
      setSelectedWorkoutId(firstWorkout.id)
      loadWorkout(firstWorkout.id)
      loadProgress(firstWorkout.id)
    }
  }, [workouts, selectedWorkoutId, loadWorkout, loadProgress])

  const handleWorkoutSelection = (workoutId: number) => {
    setSelectedWorkoutId(workoutId)
    loadWorkout(workoutId)
    loadProgress(workoutId)
  }

  const toggleExerciseExpansion = (exerciseId: string) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId)
  }

  const openVideoDialog = (exerciseId: string) => {
    setSelectedExercise(exerciseId)
    setIsVideoOpen(true)
  }

  const handleSendFeedback = () => {
    console.log("Enviando feedback:", feedback)
    setFeedback("")
    setIsFeedbackOpen(false)
  }

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
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            {/* Seletor de Treino */}
            {workouts.length > 1 && (
              <Card className="border-none shadow-sm mb-4">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell className="h-4 w-4 text-[#df0e67]" />
                    <h3 className="font-medium text-sm md:text-base">Selecionar Treino</h3>
                  </div>
                  <Tabs
                    value={selectedWorkoutId?.toString()}
                    onValueChange={(value) => handleWorkoutSelection(Number(value))}
                  >
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {workouts.slice(0, 4).map((workout) => (
                        <TabsTrigger key={workout.id} value={workout.id.toString()} className="text-xs">
                          {workout.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Treino Atual */}
            {currentWorkout && (
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg md:text-xl">{currentWorkout.name}</CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        {currentWorkout.description} • {getWorkoutTypeLabel(currentWorkout.type)} •{" "}
                        {getWorkoutDifficultyLabel(currentWorkout.difficulty)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        currentWorkout.status === 1
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-500 bg-gray-50 text-gray-700"
                      }`}
                    >
                      {getWorkoutStatusLabel(currentWorkout.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-3 md:p-6">
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
                            {Math.round((stats.completedWorkouts / stats.totalWorkouts) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Header dos Exercícios */}
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border md:bg-transparent md:border-0 md:p-0 mb-4">
                    <div>
                      <h3 className="text-base font-medium md:text-lg flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-gray-400" />
                        Exercícios
                      </h3>
                      <p className="text-xs text-muted-foreground md:text-sm">
                        {currentWorkout.exercises?.length || 0} exercícios programados
                      </p>
                    </div>
                  </div>

                  {/* Lista de Exercícios */}
                  <div className="space-y-2 md:space-y-4">
                    {currentWorkout.exercises && currentWorkout.exercises.length > 0 ? (
                      currentWorkout.exercises.map((exercise, index) => (
                        <div key={exercise.id || index} className="overflow-hidden rounded-lg border bg-white">
                          {/* Header do Exercício */}
                          <div
                            className={`flex cursor-pointer items-center justify-between p-3 md:p-4 transition-all duration-200 hover:bg-gray-50 ${
                              expandedExercise === (exercise.id?.toString() || exercise.exerciseId.toString())
                                ? "border-b bg-gray-50"
                                : ""
                            }`}
                            onClick={() =>
                              toggleExerciseExpansion(exercise.id?.toString() || exercise.exerciseId.toString())
                            }
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm md:text-base">
                                    {exercise.exerciseName || `Exercício ${exercise.exerciseId}`}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-500">
                                      {exercise.sets} séries • {exercise.reps} reps
                                      {exercise.weight && ` • ${exercise.weight}kg`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {exercise.videoUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openVideoDialog(exercise.id?.toString() || exercise.exerciseId.toString())
                                  }}
                                >
                                  <Play className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              {expandedExercise === (exercise.id?.toString() || exercise.exerciseId.toString()) ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Conteúdo Expandido */}
                          {expandedExercise === (exercise.id?.toString() || exercise.exerciseId.toString()) && (
                            <div className="p-3 md:p-4 bg-gray-50">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-[#df0e67]">{exercise.sets}</div>
                                  <div className="text-xs text-gray-500">Séries</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">{exercise.reps}</div>
                                  <div className="text-xs text-gray-500">Repetições</div>
                                </div>
                                {exercise.weight && (
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">{exercise.weight}kg</div>
                                    <div className="text-xs text-gray-500">Carga</div>
                                  </div>
                                )}
                                {exercise.restTime && (
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-orange-600">{exercise.restTime}s</div>
                                    <div className="text-xs text-gray-500">Descanso</div>
                                  </div>
                                )}
                              </div>

                              {exercise.notes && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                  <p className="text-xs font-medium md:text-sm">💡 Instruções</p>
                                  <p className="text-xs md:text-sm mt-1">{exercise.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">Nenhum exercício encontrado</p>
                        <p className="text-sm">Os exercícios aparecerão aqui quando forem adicionados ao treino.</p>
                      </div>
                    )}
                  </div>

                  {/* Observações do Treino */}
                  {currentWorkout.notes && (
                    <div className="mt-4 md:mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3 md:p-4">
                      <h3 className="mb-2 font-medium text-sm md:text-base">📋 Observações do Treino</h3>
                      <p className="text-xs md:text-sm">{currentWorkout.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Progresso */}
            {progress && progress.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Progresso</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Últimos registros</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {progress.slice(0, 3).map((p, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>{new Date(p.date).toLocaleDateString("pt-BR")}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{p.rating}/10</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Energia</div>
                            <div className="font-medium">{p.energyLevel}/10</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Humor</div>
                            <div className="font-medium">{getWorkoutMoodLabel(p.mood)}</div>
                          </div>
                        </div>
                        {p.notes && <div className="mt-2 text-xs text-gray-600">Notas: {p.notes}</div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico */}
            {workoutHistory && workoutHistory.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Histórico
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Treinos anteriores</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {workoutHistory.slice(0, 5).map((h, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{h.workoutName}</p>
                          <p className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{h.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Feedback</CardTitle>
                <CardDescription className="text-xs md:text-sm">Como está o treino?</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {!isMobile && (
                    <p className="text-sm">Compartilhe suas impressões sobre o treino com seu personal trainer.</p>
                  )}

                  <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-10 md:h-12 bg-[#df0e67] hover:bg-[#c00c5a] text-sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Enviar Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] mx-4">
                      <DialogHeader>
                        <DialogTitle>Enviar Feedback</DialogTitle>
                        <DialogDescription>Compartilhe suas impressões sobre o treino.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Textarea
                          placeholder="Digite seu feedback aqui..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="min-h-[100px] md:min-h-[150px]"
                        />
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsFeedbackOpen(false)}
                          className="flex-1 md:flex-none"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSendFeedback}
                          className="bg-[#df0e67] hover:bg-[#c00c5a] flex-1 md:flex-none"
                        >
                          Enviar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Video Dialog */}
        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <DialogContent className="sm:max-w-[600px] mx-4">
            <DialogHeader>
              <DialogTitle>Vídeo do Exercício</DialogTitle>
              <DialogDescription>Assista ao vídeo demonstrativo do exercício.</DialogDescription>
            </DialogHeader>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <Play className="h-12 w-12 text-gray-400" />
              <p className="ml-2 text-gray-500">Vídeo não disponível</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
