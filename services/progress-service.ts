import type {
  LessonProgress,
  UpdateProgressData,
  ProgressFilters,
  CourseProgressSummary,
  UserProgressStats,
} from "@/types/progress"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:44394/api"

class ProgressService {
  private async getAuthHeaders() {
    const token = localStorage.getItem("authToken")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  async getProgress(filters: ProgressFilters): Promise<LessonProgress[]> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/Progress?${params}`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar progresso")
    }

    return response.json()
  }

  async updateProgress(data: UpdateProgressData): Promise<LessonProgress> {
    const response = await fetch(`${API_BASE_URL}/Progress`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar progresso")
    }

    return response.json()
  }

  // Métodos auxiliares para calcular estatísticas
  async getCourseProgress(userId: number, courseId: number): Promise<CourseProgressSummary> {
    const progress = await this.getProgress({ userId, courseId })

    const totalLessons = progress.length
    const completedLessons = progress.filter((p) => p.isCompleted).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const totalWatchTime = progress.reduce((sum, p) => sum + p.watchTimeMinutes, 0)
    const lastAccessedDate =
      progress.length > 0
        ? progress.reduce(
            (latest, p) => (new Date(p.updatedDate) > new Date(latest) ? p.updatedDate : latest),
            progress[0].updatedDate,
          )
        : null

    return {
      courseId,
      courseTitle: progress[0]?.lessonTitle || "Curso",
      totalLessons,
      completedLessons,
      progressPercentage,
      totalWatchTime,
      lastAccessedDate,
      isCompleted: progressPercentage === 100,
    }
  }

  async getUserProgressStats(userId: number): Promise<UserProgressStats> {
    // Para obter todas as estatísticas do usuário, precisaríamos fazer múltiplas chamadas
    // ou ter um endpoint específico na API. Por enquanto, vamos simular com dados básicos
    const progress = await this.getProgress({ userId })

    // Agrupar por curso (assumindo que temos courseId no progresso)
    const courseGroups = progress.reduce(
      (groups, p) => {
        // Como não temos courseId diretamente, vamos usar enrollmentId como proxy
        const key = p.enrollmentId
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(p)
        return groups
      },
      {} as Record<number, LessonProgress[]>,
    )

    const coursesProgress: CourseProgressSummary[] = Object.entries(courseGroups).map(([enrollmentId, lessons]) => {
      const totalLessons = lessons.length
      const completedLessons = lessons.filter((l) => l.isCompleted).length
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      const totalWatchTime = lessons.reduce((sum, l) => sum + l.watchTimeMinutes, 0)
      const lastAccessedDate =
        lessons.length > 0
          ? lessons.reduce(
              (latest, l) => (new Date(l.updatedDate) > new Date(latest) ? l.updatedDate : latest),
              lessons[0].updatedDate,
            )
          : null

      return {
        courseId: Number.parseInt(enrollmentId),
        courseTitle: `Curso ${enrollmentId}`,
        totalLessons,
        completedLessons,
        progressPercentage,
        totalWatchTime,
        lastAccessedDate,
        isCompleted: progressPercentage === 100,
      }
    })

    const totalCourses = coursesProgress.length
    const completedCourses = coursesProgress.filter((c) => c.isCompleted).length
    const inProgressCourses = totalCourses - completedCourses
    const totalWatchTime = coursesProgress.reduce((sum, c) => sum + c.totalWatchTime, 0)
    const averageProgress =
      totalCourses > 0
        ? Math.round(coursesProgress.reduce((sum, c) => sum + c.progressPercentage, 0) / totalCourses)
        : 0

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalWatchTime,
      averageProgress,
      coursesProgress,
    }
  }
}

export const progressService = new ProgressService()
