export interface LessonProgress {
  id: number
  enrollmentId: number
  lessonId: number
  lessonTitle: string
  isCompleted: boolean
  completedDate: string | null
  watchTimeMinutes: number
  createdDate: string
  updatedDate: string
}

export interface UpdateProgressData {
  enrollmentId: number
  lessonId: number
  isCompleted: boolean
  watchTimeMinutes: number
}

export interface ProgressFilters {
  userId?: number
  courseId?: number
  enrollmentId?: number
  lessonId?: number
}

export interface CourseProgressSummary {
  courseId: number
  courseTitle: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  totalWatchTime: number
  lastAccessedDate: string | null
  isCompleted: boolean
}

export interface UserProgressStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalWatchTime: number
  averageProgress: number
  coursesProgress: CourseProgressSummary[]
}
