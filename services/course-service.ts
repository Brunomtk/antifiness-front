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
import { api } from "@/lib/api"

class CourseService {
  // Course CRUD operations
  async getCourses(filters?: CourseFilters): Promise<CoursesResponse> {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
    }

    const response = await api.get(`/Course?${params}`)
    return response.data
  }

  async getCourse(id: number): Promise<Course> {
    const response = await api.get(`/Course/${id}`)
    return response.data
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await api.post("/Course", data)
    return response.data
  }

  async updateCourse(id: number, data: UpdateCourseData): Promise<Course> {
    const response = await api.put(`/Course/${id}`, data)
    return response.data
  }

  async deleteCourse(id: number): Promise<void> {
    await api.delete(`/Course/${id}`)
  }

  async publishCourse(id: number): Promise<{ message: string }> {
    const response = await api.post(`/Course/${id}/publish`, "")
    return response.data
  }

  // Lesson operations
  async getLessons(courseId: number): Promise<CourseLesson[]> {
    const response = await api.get(`/Course/${courseId}/lessons`)
    return response.data
  }

  async getLesson(courseId: number, lessonId: number): Promise<CourseLesson> {
    const response = await api.get(`/Course/${courseId}/lessons/${lessonId}`)
    return response.data
  }

  async createLesson(courseId: number, data: CreateLessonData): Promise<CourseLesson> {
    const response = await api.post(`/Course/${courseId}/lessons`, data)
    return response.data
  }

  async updateLesson(courseId: number, lessonId: number, data: UpdateLessonData): Promise<CourseLesson> {
    const response = await api.put(`/Course/${courseId}/lessons/${lessonId}`, data)
    return response.data
  }

  async deleteLesson(courseId: number, lessonId: number): Promise<void> {
    await api.delete(`/Course/${courseId}/lessons/${lessonId}`)
  }

  // Enrollment operations
  async getEnrollments(filters?: { empresasId?: number; courseId?: number; userId?: number }): Promise<
    CourseEnrollment[]
  > {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await api.get(`/Enrollment?${params}`)
    return response.data
  }

  async getEnrollment(id: number): Promise<CourseEnrollment> {
    const response = await api.get(`/Enrollment/${id}`)
    return response.data
  }

  async createEnrollment(data: CreateEnrollmentData): Promise<CourseEnrollment> {
    const response = await api.post("/Enrollment", data)
    return response.data
  }

  async updateEnrollment(id: number, data: UpdateEnrollmentData): Promise<CourseEnrollment> {
    const response = await api.put(`/Enrollment/${id}`, data)
    return response.data
  }

  // Review operations
  async getReviews(courseId: number): Promise<CourseReview[]> {
    const response = await api.get(`/Course/${courseId}/reviews`)
    return response.data
  }

  async createReview(courseId: number, data: CreateReviewData): Promise<CourseReview> {
    const response = await api.post(`/Course/${courseId}/reviews`, data)
    return response.data
  }

  // Statistics
  async getStats(): Promise<CourseStats> {
    const response = await api.get("/Course/stats")
    return response.data
  }

  async getCourseStats(courseId: number): Promise<CourseStats> {
    const response = await api.get(`/Course/${courseId}/stats`)
    return response.data
  }
}

export const courseService = new CourseService()
