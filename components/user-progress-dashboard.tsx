"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Clock, Trophy, TrendingUp } from "lucide-react"
import { useUserProgressStats } from "@/hooks/use-progress"
import { CourseProgressBar } from "./course-progress-bar"

interface UserProgressDashboardProps {
  userId: number
}

export function UserProgressDashboard({ userId }: UserProgressDashboardProps) {
  const { userStats, loading, error, fetchUserStats } = useUserProgressStats()

  useEffect(() => {
    fetchUserStats(userId)
  }, [userId, fetchUserStats])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Erro ao carregar estatísticas: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Nenhuma estatística encontrada</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">{userStats.completedCourses} concluídos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.averageProgress}%</div>
            <Progress value={userStats.averageProgress} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(userStats.totalWatchTime)}</div>
            <p className="text-xs text-muted-foreground">de estudo acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">cursos finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso dos Cursos */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso dos Cursos</CardTitle>
          <CardDescription>Acompanhe seu progresso em cada curso</CardDescription>
        </CardHeader>
        <CardContent>
          {userStats.coursesProgress.length > 0 ? (
            <div className="space-y-6">
              {userStats.coursesProgress.map((courseProgress) => (
                <CourseProgressBar key={courseProgress.courseId} progress={courseProgress} showDetails={true} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Você ainda não iniciou nenhum curso</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
