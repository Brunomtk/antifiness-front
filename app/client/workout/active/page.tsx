"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useClientWorkout } from "@/hooks/use-client-workout"
import { useWorkoutTimer } from "@/hooks/use-workout-timer"
import { WorkoutTimer } from "@/components/workout/WorkoutTimer"
import { ExerciseCard } from "@/components/workout/ExerciseCard"
import { WorkoutCompletion } from "@/components/workout/WorkoutCompletion"
import { useMobile } from "@/hooks/use-mobile"
import { WorkoutHistory } from "@/components/workout/WorkoutHistory"
import { ExerciseVideoModal } from "@/components/workout/ExerciseVideoModal"

export default function ActiveWorkoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workoutId = searchParams.get("id")
  const isMobile = useMobile()

  const {
    currentWorkout,
    loading,
    error,
    loadWorkout,
    updateExerciseCompletion,
    recordProgress,
    workoutHistory,
    loadWorkoutHistory,
  } = useClientWorkout()

  const {
    totalTime,
    restTime,
    isRunning,
    isResting,
    start,
    pause,
    resume,
    stop,
    startRest,
    skipRest,
    formatTotalTime,
    formatRestTime,
    isTimerActive,
  } = useWorkoutTimer()

  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [startTime, setStartTime] = useState<string>("")
  const [exerciseStates, setExerciseStates] = useState<
    Record<
      number,
      {
        isCompleted: boolean
        completedSets: number
        isExpanded: boolean
      }
    >
  >({})
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null)
  const [isCompletionOpen, setIsCompletionOpen] = useState(false)

  // Load workout on mount
  useEffect(() => {
    if (workoutId) {
      loadWorkout(Number(workoutId))
    }
  }, [workoutId, loadWorkout])

  // Initialize exercise states when workout loads
  useEffect(() => {
    if (currentWorkout?.exercises) {
      const initialStates: Record<
        number,
        {
          isCompleted: boolean
          completedSets: number
          isExpanded: boolean
        }
      > = {}

      currentWorkout.exercises.forEach((exercise) => {
        initialStates[exercise.id ?? exercise.exerciseId] = {
          isCompleted: exercise.isCompleted || false,
          completedSets: exercise.completedSets || 0,
          isExpanded: false,
        }
      })

      setExerciseStates(initialStates)
    }
  }, [currentWorkout])

  // Load workout history on mount
  useEffect(() => {
    loadWorkoutHistory()
  }, [loadWorkoutHistory])

  const handleStartWorkout = () => {
    setWorkoutStarted(true)
    setStartTime(
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    )
    start()
  }

  const handleExerciseToggle = async (exerciseId: number, isCompleted: boolean) => {
    console.log("[v0] ===== EXERCISE TOGGLE START =====")
    console.log("[v0] Exercise ID:", exerciseId)
    console.log("[v0] New Completed State:", isCompleted)
    console.log("[v0] Current exerciseStates before update:", JSON.stringify(exerciseStates, null, 2))

    // Update only the specific exercise state
    setExerciseStates((prev) => {
      const updatedState = {
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          isCompleted,
          completedSets: isCompleted
            ? currentWorkout?.exercises?.find((e) => (e.id ?? e.exerciseId) === exerciseId)?.sets || 0
            : 0,
        },
      }

      console.log("[v0] Updated exerciseStates:", JSON.stringify(updatedState, null, 2))
      console.log("[v0] ===== EXERCISE TOGGLE END =====")

      return updatedState
    })

    // Update via API
    if (currentWorkout) {
      // Live save disabled by default due to backend EF duplicate tracking with duplicated exerciseId.
      if (process.env.NEXT_PUBLIC_WORKOUT_LIVE_SAVE === "true") {
        await updateExerciseCompletion(
          currentWorkout.id,
          exerciseId,
          isCompleted,
          isCompleted ? currentWorkout.exercises?.find((e) => (e.id ?? e.exerciseId) === exerciseId)?.sets || 0 : 0,
        )
      }
    }
  }

  const handleSetComplete = (exerciseId: number, setIndex: number) => {
    setExerciseStates((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completedSets: prev[exerciseId].completedSets + 1,
      },
    }))
  }

  const handleToggleExpand = (exerciseId: number) => {
    setExerciseStates((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        isExpanded: !prev[exerciseId].isExpanded,
      },
    }))
  }

  const handlePlayVideo = (exerciseId: number) => {
    setSelectedExercise(exerciseId)
    setIsVideoOpen(true)
  }

  const handleFinishWorkout = () => {
    stop()
    setIsCompletionOpen(true)
  }

  const handleWorkoutCompletion = async (data: {
    rating: number
    mood: number
    energyLevel: number
    notes: string
  }) => {
    if (!currentWorkout) return

    const endTime = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const progressData = {
      // clientId omitted; backend infers from token
      date: new Date().toISOString(),
      actualDuration: totalTime,
      actualCalories: undefined,
      rating: data.rating,
      mood: data.mood,
      energyLevel: data.energyLevel,
      isCompleted: true,
      exerciseProgress: currentWorkout.exercises?.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        completedSets: Number(exerciseStates[exercise.id ?? exercise.exerciseId]?.completedSets) || 0,
        completedReps: Number(
          exercise.reps * (Number(exerciseStates[exercise.id ?? exercise.exerciseId]?.completedSets) || 0),
        ),
        weight: exercise.weight,
        isCompleted: Boolean(exerciseStates[exercise.id ?? exercise.exerciseId]?.isCompleted) || false,
      })),
      notes: data.notes,
    }

    const success = await recordProgress(currentWorkout.id, progressData)

    if (success) {
      router.push("/client/workout")
    }
  }

  const handleShare = () => {
    // Generate workout summary for sharing
    const summary =
      `🏋️ Treino Concluído!\n\n` +
      `📋 ${currentWorkout?.name}\n` +
      `⏰ Duração: ${formatTotalTime()}\n` +
      `🎯 Exercícios: ${currentWorkout?.exercises?.length || 0}\n` +
      `💪 Concluído com sucesso!\n\n` +
      `#AntiFinessApp #Treino #Fitness`

    if (navigator.share) {
      navigator.share({
        title: "Treino Concluído - Anti-Fitness",
        text: summary,
        url: window.location.origin,
      })
    } else {
      navigator.clipboard.writeText(summary)
      // Could show a toast here
    }
  }

  if (loading.workout) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-3 md:p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-16 w-full mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error.workout || !currentWorkout) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="p-3 md:p-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.workout || "Treino não encontrado"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const completedExercises = Object.values(exerciseStates).filter((state) => state.isCompleted).length
  const totalExercises = currentWorkout.exercises?.length || 0
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <div className="p-3 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold">{workoutStarted ? "Treino em Andamento" : "Iniciar Treino"}</h1>
            {workoutStarted && (
              <p className="text-sm text-gray-600">
                {completedExercises}/{totalExercises} exercícios concluídos
              </p>
            )}
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Timer */}
        {workoutStarted && (
          <WorkoutTimer
            totalTime={totalTime}
            restTime={restTime}
            isRunning={isRunning}
            isResting={isResting}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onStop={stop}
            onSkipRest={skipRest}
            formatTotalTime={formatTotalTime}
            formatRestTime={formatRestTime}
            className="mb-4"
          />
        )}

        {/* Workout Info */}
        {!workoutStarted && (
          <Card className="workout-gradient text-white mb-6">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl mb-2">{currentWorkout.name}</CardTitle>
              <p className="text-white/90 mb-4">
                Você está no "modo visualização". Aperte INICIAR para começar seu treino.
              </p>
              <Button
                onClick={handleStartWorkout}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg"
              >
                INICIAR
              </Button>
            </CardHeader>
          </Card>
        )}

        {/* Progress Bar */}
        {workoutStarted && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso do Treino</span>
                <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="workout-success-gradient h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercises */}
        <div className="space-y-4">
          {currentWorkout.exercises?.map((exercise, index) => (
            <ExerciseCard
              key={`exercise-${exercise.id ?? exercise.exerciseId}-${index}`}
              exercise={exercise}
              index={index}
              isCompleted={exerciseStates[exercise.id ?? exercise.exerciseId]?.isCompleted || false}
              completedSets={exerciseStates[exercise.id ?? exercise.exerciseId]?.completedSets || 0}
              onToggleComplete={handleExerciseToggle}
              onSetComplete={handleSetComplete}
              onStartRest={startRest}
              onPlayVideo={handlePlayVideo}
              isExpanded={exerciseStates[exercise.id ?? exercise.exerciseId]?.isExpanded || false}
              onToggleExpand={() => handleToggleExpand(exercise.id ?? exercise.exerciseId)}
            />
          ))}
        </div>

        {/* Workout History Section */}
        {!workoutStarted && <WorkoutHistory history={workoutHistory} loading={loading.history} className="mt-6" />}

        {/* Finish Workout Button */}
        {workoutStarted && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <Button
                onClick={handleFinishWorkout}
                className="w-full workout-gradient hover:opacity-90 text-white py-3 text-lg font-semibold"
                disabled={completedExercises === 0}
              >
                Finalizar treino
              </Button>
              {completedExercises === 0 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Complete pelo menos um exercício para finalizar
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Video Dialog */}
        <ExerciseVideoModal isOpen={isVideoOpen} onOpenChange={setIsVideoOpen} exerciseId={selectedExercise} />

        {/* Workout Completion Dialog */}
        <WorkoutCompletion
          isOpen={isCompletionOpen}
          onClose={() => setIsCompletionOpen(false)}
          workoutName={currentWorkout.name}
          startTime={startTime}
          endTime={new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          duration={formatTotalTime()}
          onSubmit={handleWorkoutCompletion}
          onShare={handleShare}
        />
      </div>
    </div>
  )
}
