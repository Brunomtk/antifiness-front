export interface Course {
  id: number
  title: string
  description: string
  thumbnail: string
  instructor: string
  category: number
  categoryName: string
  level: number
  levelName: string
  durationMinutes: number
  price: number
  currency: string
  tags: string[]
  empresasId: number
  empresasName: string | null
  status: number
  statusName: string
  publishedDate: string | null
  createdDate: string
  updatedDate: string
  lessonsCount: number
  enrollmentsCount: number
  averageRating: number
  reviewsCount: number
}

export interface CourseLesson {
  id: number
  title: string
  description: string
  content: string
  durationMinutes: number
  order: number
  resources: string[]
  videoUrl: string
  courseId: number
  courseTitle: string | null
  createdDate: string
  updatedDate: string
  isCompleted: boolean
  completedDate: string | null
}

export interface CourseEnrollment {
  id: number
  empresasId: number
  empresasName: string | null
  courseId: number
  courseTitle: string | null
  userId: number
  userName: string | null
  startDate: string
  completionDate: string | null
  status: number
  statusName: string
  progressPercentage: number
  createdDate: string
  updatedDate: string
  completedLessons: number
  totalLessons: number
}

export interface CourseReview {
  id: number
  courseId: number
  courseTitle: string | null
  userId: number
  userName: string | null
  rating: number
  comment: string
  reviewDate: string
  createdDate: string
  updatedDate: string
}

export interface CourseStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  completionRate: number
  popularCategories: Array<{
    category: string
    count: number
    percentage: number
  }>
  monthlyEnrollments: Array<{
    month: string
    count: number
  }>
}

export interface CoursesResponse {
  courses: Course[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CourseFilters {
  search?: string
  category?: number
  level?: number
  status?: number
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
  empresasId?: number
  instructor?: string
  page?: number
  pageSize?: number
}

export interface CreateCourseData {
  title: string
  description: string
  thumbnail: string
  instructor: string
  category: number
  level: number
  durationMinutes: number
  price: number
  currency: string
  tags: string[]
  empresasId: number
}

export interface UpdateCourseData {
  title: string
  description: string
  thumbnail: string
  instructor: string
  category: number
  level: number
  durationMinutes: number
  price: number
  currency: string
  tags: string[]
  status: number
}

export interface CreateLessonData {
  title: string
  description: string
  content: string
  durationMinutes: number
  order: number
  resources: string[]
  videoUrl: string
}

export interface UpdateLessonData extends CreateLessonData {}

export interface CreateEnrollmentData {
  empresasId: number
  courseId: number
  userId: number
  startDate: string
}

export interface UpdateEnrollmentData {
  status: number
  completionDate?: string
  progressPercentage: number
}

export interface CreateReviewData {
  userId: number
  rating: number
  comment: string
}

// Enums para mapear os valores da API
export enum CourseCategory {
  FITNESS = 1,
  NUTRITION = 2,
  WELLNESS = 3,
  COOKING = 4,
  SUPPLEMENTS = 5,
  PSYCHOLOGY = 6,
  BUSINESS = 7,
}

export enum CourseLevel {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
  ALL_LEVELS = 4,
}

export enum CourseStatus {
  DRAFT = 1,
  PUBLISHED = 2,
  ARCHIVED = 3,
  PRIVATE = 4,
}

export enum EnrollmentStatus {
  ACTIVE = 1,
  COMPLETED = 2,
  DROPPED = 3,
  SUSPENDED = 4,
}
