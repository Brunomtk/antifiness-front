"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Play, ChevronDown, ChevronUp, Hash, Weight, RotateCcw, CheckCircle2, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkoutExercise } from "@/types/workout"

interface ExerciseCardProps {
  exercise: WorkoutExercise & { exerciseName?: string }
  index: number
  isCompleted: boolean
  completedSets: number
  onToggleComplete: (exerciseId: number, isCompleted: boolean) => void
  onSetComplete: (exerciseId: number, setIndex: number) => void
  onStartRest: (duration: number) => void
  onPlayVideo?: (exerciseId: number) => void
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function ExerciseCard({
  exercise,
  index,
  isCompleted,
  completedSets,
  onToggleComplete,
  onSetComplete,
  onStartRest,
  onPlayVideo,
  isExpanded = false,
  onToggleExpand,
}: ExerciseCardProps) {
  const [localCompletedSets, setLocalCompletedSets] = useState<boolean[]>(Array(exercise.sets).fill(false))

  const handleSetToggle = (setIndex: number) => {
    const newCompletedSets = [...localCompletedSets]
    newCompletedSets[setIndex] = !newCompletedSets[setIndex]
    setLocalCompletedSets(newCompletedSets)

    onSetComplete(exercise.id ?? exercise.exerciseId, setIndex)

    // Start rest timer if set is completed and rest time is defined
    if (newCompletedSets[setIndex] && exercise.restTime) {
      onStartRest(exercise.restTime)
    }
  }

  const handleExerciseToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("[v0] Exercise toggle clicked for exerciseId:", exercise.exerciseId)
    console.log("[v0] Current isCompleted:", isCompleted)

    const newCompleted = !isCompleted
    console.log("[v0] New completed state:", newCompleted)

    onToggleComplete(exercise.id ?? exercise.exerciseId, newCompleted)

    if (newCompleted) {
      setLocalCompletedSets(Array(exercise.sets).fill(true))
    } else {
      setLocalCompletedSets(Array(exercise.sets).fill(false))
    }
  }

  const completedSetsCount = localCompletedSets.filter(Boolean).length
  const progressPercentage = (completedSetsCount / exercise.sets) * 100

  return (
    <Card
      className={cn(
        "workout-card-shadow border-0 transition-all duration-300",
        isCompleted && "bg-green-50 border-green-200",
      )}
    >
      <CardContent className="p-0">
        {/* Exercise Header */}
        <div
          className={cn(
            "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors",
            isExpanded && "border-b",
          )}
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Exercise Number */}
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm",
                isCompleted ? "workout-success-gradient" : "workout-gradient",
              )}
            >
              {isCompleted ? <CheckCircle2 className="h-4 w-4 animate-checkmark-bounce" /> : index + 1}
            </div>

            {/* Exercise Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base">
                  {exercise.exerciseName || `Exercício ${exercise.exerciseId}`}
                </h3>
                {isCompleted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Concluído
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span>{exercise.sets} séries</span>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" />
                  <span>{exercise.reps} reps</span>
                </div>
                {exercise.weight && (
                  <div className="flex items-center gap-1">
                    <Weight className="h-3 w-3" />
                    <span>{exercise.weight}kg</span>
                  </div>
                )}
                {exercise.restTime && (
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    <span>{exercise.restTime}s</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="workout-success-gradient h-2 rounded-full transition-all duration-500 animate-progress-fill"
                  style={{ "--progress-width": `${progressPercentage}%` } as any}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded transition-colors"
              onClick={handleExerciseToggle}
              role="button"
              aria-label={isCompleted ? "Marcar como não concluído" : "Marcar como concluído"}
            >
              <Checkbox
                checked={isCompleted}
                className="data-[state=checked]:workout-success-gradient data-[state=checked]:border-green-500 pointer-events-none"
                tabIndex={-1}
              />
            </div>

            {onPlayVideo && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation()
                  onPlayVideo(exercise.exerciseId)
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}

            {onToggleExpand &&
              (isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ))}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 bg-gray-50">
            {/* Sets Tracking */}
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Séries ({completedSetsCount}/{exercise.sets})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Array.from({ length: exercise.sets }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                      localCompletedSets[i]
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-white border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() => handleSetToggle(i)}
                  >
                    <span className="font-medium text-sm">Série {i + 1}</span>
                    <Checkbox
                      checked={localCompletedSets[i]}
                      onCheckedChange={() => handleSetToggle(i)}
                      className="data-[state=checked]:workout-success-gradient data-[state=checked]:border-green-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Exercise Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-lg font-bold text-blue-600">{exercise.sets}</div>
                <div className="text-xs text-gray-500">Séries</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-lg font-bold text-green-600">{exercise.reps}</div>
                <div className="text-xs text-gray-500">Repetições</div>
              </div>
              {exercise.weight && (
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-lg font-bold text-purple-600">{exercise.weight}kg</div>
                  <div className="text-xs text-gray-500">Carga</div>
                </div>
              )}
              {exercise.restTime && (
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-lg font-bold text-orange-600">{exercise.restTime}s</div>
                  <div className="text-xs text-gray-500">Descanso</div>
                </div>
              )}
            </div>

            {/* Exercise Notes */}
            {exercise.notes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-sm text-blue-800 mb-1">💡 Instruções</h5>
                <p className="text-sm text-blue-700">{exercise.notes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
