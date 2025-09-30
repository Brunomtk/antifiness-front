"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { History, Calendar, Clock, Star, Zap, Trophy, ChevronDown, ChevronUp, Target, Hash, Weight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkoutProgress } from "@/types/workout"

interface WorkoutHistoryProps {
  history: WorkoutProgress[]
  loading: boolean
  className?: string
}

export function WorkoutHistory({ history, loading, className }: WorkoutHistoryProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getMoodEmoji = (mood?: number) => {
    const moodMap: Record<number, string> = {
      1: "😞",
      2: "😕",
      3: "😐",
      4: "😊",
      5: "😄",
    }
    return mood ? moodMap[mood] || "😐" : "😐"
  }

  const getEnergyColor = (energy?: number) => {
    if (!energy) return "text-gray-500"
    if (energy <= 2) return "text-red-500"
    if (energy <= 3) return "text-orange-500"
    if (energy <= 4) return "text-yellow-500"
    return "text-green-500"
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Treinos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Treinos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum treino concluído ainda</p>
            <p className="text-sm">Complete seu primeiro treino para ver o histórico aqui!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Treinos
          <Badge variant="secondary" className="ml-auto">
            {history.length} treinos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {history.map((workout) => {
            const isExpanded = expandedItems.has(workout.id)
            const completedExercises = workout.exerciseProgress?.filter((ex) => ex.isCompleted).length || 0
            const totalExercises = workout.exerciseProgress?.length || 0

            return (
              <div
                key={workout.id}
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200",
                  workout.isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
                )}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpanded(workout.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{workout.workoutName || "Treino"}</h3>
                      {workout.isCompleted && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Concluído
                        </Badge>
                      )}
                      {workout.hasPersonalRecord && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          PR
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(workout.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(workout.actualDuration)}</span>
                      </div>
                      {workout.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{workout.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {completedExercises}/{totalExercises}
                      </div>
                      <div className="text-gray-500 text-xs">exercícios</div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {workout.mood && (
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-2xl mb-1">{getMoodEmoji(workout.mood)}</div>
                          <div className="text-xs text-gray-500">Humor</div>
                        </div>
                      )}

                      {workout.energyLevel && (
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className={cn("text-lg font-bold", getEnergyColor(workout.energyLevel))}>
                            <Zap className="h-4 w-4 inline mr-1" />
                            {workout.energyLevel}/5
                          </div>
                          <div className="text-xs text-gray-500">Energia</div>
                        </div>
                      )}

                      {workout.actualCalories && (
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-lg font-bold text-orange-600">{workout.actualCalories}</div>
                          <div className="text-xs text-gray-500">Calorias</div>
                        </div>
                      )}

                      <div className="text-center p-3 bg-white rounded-lg border">
                        <div className="text-lg font-bold text-blue-600">
                          {Math.round((completedExercises / totalExercises) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">Conclusão</div>
                      </div>
                    </div>

                    {/* Exercise Progress */}
                    {workout.exerciseProgress && workout.exerciseProgress.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Exercícios Realizados
                        </h4>
                        <div className="space-y-2">
                          {workout.exerciseProgress.map((exercise, index) => (
                            <div
                              key={exercise.exerciseId}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border text-sm",
                                exercise.isCompleted ? "bg-green-100 border-green-300" : "bg-gray-100 border-gray-300",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                    exercise.isCompleted ? "bg-green-500 text-white" : "bg-gray-400 text-white",
                                  )}
                                >
                                  {exercise.isCompleted ? "✓" : index + 1}
                                </div>
                                <span className="font-medium">
                                  {exercise.exerciseName || `Exercício ${exercise.exerciseId}`}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                {exercise.completedSets && (
                                  <div className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    <span>{exercise.completedSets} séries</span>
                                  </div>
                                )}
                                {exercise.weight && (
                                  <div className="flex items-center gap-1">
                                    <Weight className="h-3 w-3" />
                                    <span>{exercise.weight}kg</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {workout.notes && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-sm text-blue-800 mb-1">📝 Observações</h5>
                        <p className="text-sm text-blue-700">{workout.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
