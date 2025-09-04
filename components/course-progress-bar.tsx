"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, PlayCircle } from "lucide-react"
import type { CourseProgressSummary } from "@/types/progress"

interface CourseProgressBarProps {
  progress: CourseProgressSummary
  showDetails?: boolean
  className?: string
}

export function CourseProgressBar({ progress, showDetails = true, className }: CourseProgressBarProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatusBadge = () => {
    if (progress.isCompleted) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Concluído
        </Badge>
      )
    }

    if (progress.progressPercentage > 0) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          <PlayCircle className="w-3 h-3 mr-1" />
          Em Progresso
        </Badge>
      )
    }

    return <Badge variant="outline">Não Iniciado</Badge>
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-sm">{progress.courseTitle}</h4>
          {getStatusBadge()}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{progress.progressPercentage}%</span>
      </div>

      <Progress value={progress.progressPercentage} className="h-2" />

      {showDetails && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>
              {progress.completedLessons} de {progress.totalLessons} aulas
            </span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(progress.totalWatchTime)}</span>
            </div>
          </div>
          {progress.lastAccessedDate && (
            <span>Último acesso: {new Date(progress.lastAccessedDate).toLocaleDateString("pt-BR")}</span>
          )}
        </div>
      )}
    </div>
  )
}
