"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Play, Pause } from "lucide-react"
import { useProgress } from "@/hooks/use-progress"
import type { LessonProgress } from "@/types/progress"

interface LessonProgressTrackerProps {
  enrollmentId: number
  lessonId: number
  lessonTitle: string
  lessonDuration: number
  initialProgress?: LessonProgress
  onProgressUpdate?: (progress: LessonProgress) => void
}

export function LessonProgressTracker({
  enrollmentId,
  lessonId,
  lessonTitle,
  lessonDuration,
  initialProgress,
  onProgressUpdate,
}: LessonProgressTrackerProps) {
  const { updateProgress, markLessonComplete, markLessonIncomplete, loading } = useProgress()
  const [watchTime, setWatchTime] = useState(initialProgress?.watchTimeMinutes || 0)
  const [isWatching, setIsWatching] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const isCompleted = initialProgress?.isCompleted || false
  const progressPercentage = lessonDuration > 0 ? Math.min((watchTime / lessonDuration) * 100, 100) : 0

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.floor((minutes % 1) * 60)

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartWatching = () => {
    setIsWatching(true)
    setStartTime(Date.now())
  }

  const handlePauseWatching = async () => {
    if (startTime) {
      const sessionTime = (Date.now() - startTime) / (1000 * 60) // Convert to minutes
      const newWatchTime = watchTime + sessionTime

      setWatchTime(newWatchTime)
      setIsWatching(false)
      setStartTime(null)

      try {
        const updatedProgress = await updateProgress({
          enrollmentId,
          lessonId,
          isCompleted: newWatchTime >= lessonDuration * 0.8, // Auto-complete at 80%
          watchTimeMinutes: Math.round(newWatchTime),
        })

        onProgressUpdate?.(updatedProgress)
      } catch (error) {
        console.error("Erro ao atualizar progresso:", error)
      }
    }
  }

  const handleMarkComplete = async () => {
    try {
      const updatedProgress = await markLessonComplete(enrollmentId, lessonId, Math.round(watchTime))
      onProgressUpdate?.(updatedProgress)
    } catch (error) {
      console.error("Erro ao marcar como concluído:", error)
    }
  }

  const handleMarkIncomplete = async () => {
    try {
      const updatedProgress = await markLessonIncomplete(enrollmentId, lessonId, Math.round(watchTime))
      onProgressUpdate?.(updatedProgress)
    } catch (error) {
      console.error("Erro ao marcar como não concluído:", error)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{lessonTitle}</CardTitle>
          {isCompleted ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <CheckCircle className="w-3 h-3 mr-1" />
              Concluída
            </Badge>
          ) : (
            <Badge variant="secondary">Em Progresso</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progresso da Aula</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Assistido: {formatTime(watchTime)}</span>
          </div>
          <span>Duração: {formatTime(lessonDuration)}</span>
        </div>

        <div className="flex items-center space-x-2">
          {!isWatching ? (
            <Button onClick={handleStartWatching} size="sm" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          ) : (
            <Button onClick={handlePauseWatching} size="sm" variant="secondary" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          )}

          {!isCompleted ? (
            <Button onClick={handleMarkComplete} size="sm" variant="outline" disabled={loading.updating}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Concluir
            </Button>
          ) : (
            <Button onClick={handleMarkIncomplete} size="sm" variant="outline" disabled={loading.updating}>
              Desmarcar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
