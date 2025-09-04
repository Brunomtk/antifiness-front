"use client"

import { useState, useCallback } from "react"
import { courseService } from "@/services/course-service"
import type {
  Course,
  CourseLesson,
  CourseEnrollment,
  CourseReview,
  CourseStats,
  CoursesResponse,
  CourseFilters,
  CreateCourseData,
  UpdateCourseData,
  CreateLessonData,
  UpdateLessonData,
  CreateEnrollmentData,
  UpdateEnrollmentData,
  CreateReviewData,
} from "@/types/course"

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesResponse, setCoursesResponse] = useState<CoursesResponse | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState({
    courses: false,
    creating: false,
    updating: false,
    deleting: false,
    publishing: false,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async (filters?: CourseFilters) => {
    setLoading((prev) => ({ ...prev, courses: true }))
    setError(null)

    try {
      const response = await courseService.getCourses(filters)
      setCoursesResponse(response)
      setCourses(response.courses)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cursos")
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }))
    }
  }, [])

  const getCourse = useCallback(async (id: number) => {
    setLoading((prev) => ({ ...prev, courses: true }))
    setError(null)

    try {
      const course = await courseService.getCourse(id)
      setSelectedCourse(course)
      return course
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar curso")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }))
    }
  }, [])

  const createCourse = useCallback(async (data: CreateCourseData) => {
    setLoading((prev) => ({ ...prev, creating: true }))
    setError(null)

    try {
      const newCourse = await courseService.createCourse(data)
      setCourses((prev) => [newCourse, ...prev])
      return newCourse
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar curso")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, creating: false }))
    }
  }, [])

  const updateCourse = useCallback(
    async (id: number, data: UpdateCourseData) => {
      setLoading((prev) => ({ ...prev, updating: true }))
      setError(null)

      try {
        const updatedCourse = await courseService.updateCourse(id, data)
        setCourses((prev) => prev.map((course) => (course.id === id ? updatedCourse : course)))
        if (selectedCourse?.id === id) {
          setSelectedCourse(updatedCourse)
        }
        return updatedCourse
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao atualizar curso")
        throw err
      } finally {
        setLoading((prev) => ({ ...prev, updating: false }))
      }
    },
    [selectedCourse],
  )

  const deleteCourse = useCallback(
    async (id: number) => {
      setLoading((prev) => ({ ...prev, deleting: true }))
      setError(null)

      try {
        await courseService.deleteCourse(id)
        setCourses((prev) => prev.filter((course) => course.id !== id))
        if (selectedCourse?.id === id) {
          setSelectedCourse(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao deletar curso")
        throw err
      } finally {
        setLoading((prev) => ({ ...prev, deleting: false }))
      }
    },
    [selectedCourse],
  )

  const publishCourse = useCallback(
    async (id: number) => {
      setLoading((prev) => ({ ...prev, publishing: true }))
      setError(null)

      try {
        await courseService.publishCourse(id)
        // Refresh the course data
        await getCourse(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao publicar curso")
        throw err
      } finally {
        setLoading((prev) => ({ ...prev, publishing: false }))
      }
    },
    [getCourse],
  )

  const selectCourse = useCallback((course: Course | null) => {
    setSelectedCourse(course)
  }, [])

  return {
    courses,
    coursesResponse,
    selectedCourse,
    loading,
    error,
    fetchCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    selectCourse,
  }
}

export function useCourseLessons() {
  const [lessons, setLessons] = useState<CourseLesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null)
  const [loading, setLoading] = useState({
    lessons: false,
    creating: false,
    updating: false,
    deleting: false,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchLessons = useCallback(async (courseId: number) => {
    setLoading((prev) => ({ ...prev, lessons: true }))
    setError(null)

    try {
      const lessonsData = await courseService.getLessons(courseId)
      setLessons(lessonsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar aulas")
    } finally {
      setLoading((prev) => ({ ...prev, lessons: false }))
    }
  }, [])

  const getLesson = useCallback(async (courseId: number, lessonId: number) => {
    setLoading((prev) => ({ ...prev, lessons: true }))
    setError(null)

    try {
      const lesson = await courseService.getLesson(courseId, lessonId)
      setSelectedLesson(lesson)
      return lesson
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar aula")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, lessons: false }))
    }
  }, [])

  const createLesson = useCallback(async (courseId: number, data: CreateLessonData) => {
    setLoading((prev) => ({ ...prev, creating: true }))
    setError(null)

    try {
      const newLesson = await courseService.createLesson(courseId, data)
      setLessons((prev) => [...prev, newLesson].sort((a, b) => a.order - b.order))
      return newLesson
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar aula")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, creating: false }))
    }
  }, [])

  const updateLesson = useCallback(
    async (courseId: number, lessonId: number, data: UpdateLessonData) => {
      setLoading((prev) => ({ ...prev, updating: true }))
      setError(null)

      try {
        const updatedLesson = await courseService.updateLesson(courseId, lessonId, data)
        setLessons((prev) => prev.map((lesson) => (lesson.id === lessonId ? updatedLesson : lesson)))
        if (selectedLesson?.id === lessonId) {
          setSelectedLesson(updatedLesson)
        }
        return updatedLesson
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao atualizar aula")
        throw err
      } finally {
        setLoading((prev) => ({ ...prev, updating: false }))
      }
    },
    [selectedLesson],
  )

  const deleteLesson = useCallback(
    async (courseId: number, lessonId: number) => {
      setLoading((prev) => ({ ...prev, deleting: true }))
      setError(null)

      try {
        await courseService.deleteLesson(courseId, lessonId)
        setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId))
        if (selectedLesson?.id === lessonId) {
          setSelectedLesson(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao deletar aula")
        throw err
      } finally {
        setLoading((prev) => ({ ...prev, deleting: false }))
      }
    },
    [selectedLesson],
  )

  return {
    lessons,
    selectedLesson,
    loading,
    error,
    fetchLessons,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    setSelectedLesson,
  }
}

export function useCourseEnrollments() {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null)
  const [loading, setLoading] = useState({
    enrollments: false,
    creating: false,
    updating: false,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchEnrollments = useCallback(
    async (filters?: { empresasId?: number; courseId?: number; userId?: number }) => {
      setLoading((prev) => ({ ...prev, enrollments: true }))
      setError(null)

      try {
        const enrollmentsData = await courseService.getEnrollments(filters)
        setEnrollments(enrollmentsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar inscrições")
      } finally {
        setLoading((prev) => ({ ...prev, enrollments: false }))
      }
    },
    [],
  )

  const getEnrollment = useCallback(async (id: number) => {
    setLoading((prev) => ({ ...prev, enrollments: true }))
    setError(null)

    try {
      const enrollment = await courseService.getEnrollment(id)
      setSelectedEnrollment(enrollment)
      return enrollment
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar inscrição")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, enrollments: false }))
    }
  }, [])

  const createEnrollment = useCallback(async (data: CreateEnrollmentData) => {
    setLoading((prev) => ({ ...prev, creating: true }))
    setError(null)

    try {
      const newEnrollment = await courseService.createEnrollment(data)
      setEnrollments((prev) => [newEnrollment, ...prev])
      return newEnrollment
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar inscrição")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, creating: false }))
    }
  }, [])

  const updateEnrollment = useCallback(
    async (id: number, data: UpdateEnrollmentData) => {
      setLoading((prev) => ({ ...prev, updating: true }))
      setError(null)

      try {
        const updatedEnrollment = await courseService.updateEnrollment(id, data)
        setEnrollments((prev) => prev.map((enrollment) => (enrollment.id === id ? updatedEnrollment : enrollment)))
        if (selectedEnrollment?.id === id) {
          setSelectedEnrollment(updatedEnrollment)
        }
        return updatedEnrollment
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao atualizar inscrição")
        throw err
      } finally {
        setLoading((prev) => ({ ...prev, updating: false }))
      }
    },
    [selectedEnrollment],
  )

  return {
    enrollments,
    selectedEnrollment,
    loading,
    error,
    fetchEnrollments,
    getEnrollment,
    createEnrollment,
    updateEnrollment,
    setSelectedEnrollment,
  }
}

export function useCourseReviews() {
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [loading, setLoading] = useState({
    reviews: false,
    creating: false,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async (courseId: number) => {
    setLoading((prev) => ({ ...prev, reviews: true }))
    setError(null)

    try {
      const reviewsData = await courseService.getReviews(courseId)
      setReviews(reviewsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar avaliações")
    } finally {
      setLoading((prev) => ({ ...prev, reviews: false }))
    }
  }, [])

  const createReview = useCallback(async (courseId: number, data: CreateReviewData) => {
    setLoading((prev) => ({ ...prev, creating: true }))
    setError(null)

    try {
      const newReview = await courseService.createReview(courseId, data)
      setReviews((prev) => [newReview, ...prev])
      return newReview
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar avaliação")
      throw err
    } finally {
      setLoading((prev) => ({ ...prev, creating: false }))
    }
  }, [])

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
  }
}

export function useCourseStats() {
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const statsData = await courseService.getStats()
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCourseStats = useCallback(async (courseId: number) => {
    setLoading(true)
    setError(null)

    try {
      const statsData = await courseService.getCourseStats(courseId)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas do curso")
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    loading,
    error,
    fetchStats,
    fetchCourseStats,
  }
}
