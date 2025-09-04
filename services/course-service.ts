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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:44394/api"

class CourseService {
  private async getAuthHeaders() {
    const token = localStorage.getItem("authToken")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

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

    const response = await fetch(`${API_BASE_URL}/Course?${params}`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar cursos")
    }

    return response.json()
  }

  async getCourse(id: number): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/Course/${id}`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar curso")
    }

    return response.json()
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/Course`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao criar curso")
    }

    return response.json()
  }

  async updateCourse(id: number, data: UpdateCourseData): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/Course/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar curso")
    }

    return response.json()
  }

  async deleteCourse(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Course/${id}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao deletar curso")
    }
  }

  async publishCourse(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/Course/${id}/publish`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: "",
    })

    if (!response.ok) {
      throw new Error("Erro ao publicar curso")
    }

    return response.json()
  }

  // Lesson operations
  async getLessons(courseId: number): Promise<CourseLesson[]> {
    const response = await fetch(`${API_BASE_URL}/Course/${courseId}/lessons`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar aulas")
    }

    return response.json()
  }

  async getLesson(courseId: number, lessonId: number): Promise<CourseLesson> {
    const response = await fetch(`${API_BASE_URL}/Course/${courseId}/lessons/${lessonId}`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar aula")
    }

    return response.json()
  }

  async createLesson(courseId: number, data: CreateLessonData): Promise<CourseLesson> {
    const response = await fetch(`${API_BASE_URL}/Course/${courseId}/lessons`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao criar aula")
    }

    return response.json()
  }

  async updateLesson(courseId: number, lessonId: number, data: UpdateLessonData): Promise<CourseLesson> {
    const response = await fetch(`${API_BASE_URL}/Course/${courseId}/lessons/${lessonId}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar aula")
    }

    return response.json()
  }

  async deleteLesson(courseId: number, lessonId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Course/${courseId}/lessons/${lessonId}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao deletar aula")
    }
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

    const response = await fetch(`${API_BASE_URL}/Enrollment?${params}`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar inscrições")
    }

    return response.json()
  }

  async getEnrollment(id: number): Promise<CourseEnrollment> {
    const response = await fetch(`${API_BASE_URL}/Enrollment/${id}`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar inscrição")
    }

    return response.json()
  }

  async createEnrollment(data: CreateEnrollmentData): Promise<CourseEnrollment> {
    const response = await fetch(`${API_BASE_URL}/Enrollment`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao criar inscrição")
    }

    return response.json()
  }

  async updateEnrollment(id: number, data: UpdateEnrollmentData): Promise<CourseEnrollment> {
    const response = await fetch(`${API_BASE_URL}/Enrollment/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao atualizar inscrição")
    }

    return response.json()
  }

  // Review operations
  async getReviews(courseId: number): Promise<CourseReview[]> {
    const response = await fetch(`${API_BASE_URL}/Course/${courseId}/reviews`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar avaliações")
    }

    return response.json()
  }

  async createReview(courseId: number, data: CreateReviewData): Promise<CourseReview> {
    const response = await fetch(`${API_BASE_URL}/Course/${courseId}/reviews`, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erro ao criar avaliação")
    }

    return response.json()
  }

  // Statistics
  async getStats(): Promise<CourseStats> {
    const response = await fetch(`${API_BASE_URL}/Course/stats`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar estatísticas")
    }

    return response.json()
  }

  async getCourseStats(courseId: number): Promise<CourseStats> {
    const response = await fetch(`${API_BASE_URL}/Course/${courseId}/stats`, {
      headers: await this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao buscar estatísticas do curso")
    }

    return response.json()
  }
}

export const courseService = new CourseService()
