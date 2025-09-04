"use client"

import type React from "react"
import { createContext, useReducer, useContext, type ReactNode } from "react"
import {
  type Course,
  type CourseLesson,
  type CourseEnrollment,
  type CourseProgress,
  type CourseReview,
  type CourseStats,
  type CourseFilters,
  CourseCategory,
  CourseLevel,
  CourseStatus,
} from "@/types/course"

interface CourseState {
  courses: Course[]
  lessons: CourseLesson[]
  enrollments: CourseEnrollment[]
  progress: CourseProgress[]
  reviews: CourseReview[]
  stats: CourseStats | null
  selectedCourse: Course | null
  selectedLesson: CourseLesson | null
  filters: CourseFilters
  loading: {
    courses: boolean
    lessons: boolean
    enrollments: boolean
    progress: boolean
    reviews: boolean
    stats: boolean
    creating: boolean
    updating: boolean
    deleting: boolean
    enrolling: boolean
  }
  error: string | null
}

type CourseAction =
  | { type: "SET_LOADING"; payload: { key: keyof CourseState["loading"]; value: boolean } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_COURSES"; payload: Course[] }
  | { type: "SET_LESSONS"; payload: CourseLesson[] }
  | { type: "SET_ENROLLMENTS"; payload: CourseEnrollment[] }
  | { type: "SET_PROGRESS"; payload: CourseProgress[] }
  | { type: "SET_REVIEWS"; payload: CourseReview[] }
  | { type: "SET_STATS"; payload: CourseStats }
  | { type: "SET_SELECTED_COURSE"; payload: Course | null }
  | { type: "SET_SELECTED_LESSON"; payload: CourseLesson | null }
  | { type: "SET_FILTERS"; payload: CourseFilters }
  | { type: "ADD_COURSE"; payload: Course }
  | { type: "UPDATE_COURSE"; payload: Course }
  | { type: "DELETE_COURSE"; payload: string }
  | { type: "ADD_LESSON"; payload: CourseLesson }
  | { type: "UPDATE_LESSON"; payload: CourseLesson }
  | { type: "DELETE_LESSON"; payload: string }
  | { type: "ADD_ENROLLMENT"; payload: CourseEnrollment }
  | { type: "UPDATE_ENROLLMENT"; payload: CourseEnrollment }
  | { type: "ADD_REVIEW"; payload: CourseReview }
  | { type: "UPDATE_PROGRESS"; payload: CourseProgress }

const initialState: CourseState = {
  courses: [
    {
      id: "1",
      title: "Nutrição Esportiva Avançada",
      description: "Curso completo sobre nutrição para atletas e praticantes de atividade física",
      thumbnail: "/placeholder.svg?height=200&width=300",
      instructor: {
        id: "1",
        name: "Dr. André Neves",
        avatar: "/andre-neves-profile.png",
        credentials: ["PhD Nutrição", "CRN 12345"],
      },
      category: CourseCategory.NUTRITION,
      level: CourseLevel.ADVANCED,
      duration: 480,
      lessonsCount: 12,
      studentsCount: 156,
      rating: 4.8,
      reviewsCount: 23,
      price: 297,
      currency: "BRL",
      tags: ["nutrição", "esporte", "performance"],
      status: CourseStatus.PUBLISHED,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-02-01"),
      publishedAt: new Date("2024-01-20"),
    },
    {
      id: "2",
      title: "Fundamentos da Alimentação Saudável",
      description: "Aprenda os princípios básicos de uma alimentação equilibrada",
      thumbnail: "/placeholder.svg?height=200&width=300",
      instructor: {
        id: "1",
        name: "Dr. André Neves",
        avatar: "/andre-neves-profile.png",
        credentials: ["PhD Nutrição", "CRN 12345"],
      },
      category: CourseCategory.NUTRITION,
      level: CourseLevel.BEGINNER,
      duration: 240,
      lessonsCount: 8,
      studentsCount: 342,
      rating: 4.6,
      reviewsCount: 45,
      price: 147,
      currency: "BRL",
      tags: ["alimentação", "saúde", "básico"],
      status: CourseStatus.PUBLISHED,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-15"),
      publishedAt: new Date("2024-02-05"),
    },
  ],
  lessons: [],
  enrollments: [],
  progress: [],
  reviews: [],
  stats: {
    totalCourses: 2,
    totalStudents: 498,
    totalRevenue: 73926,
    averageRating: 4.7,
    completionRate: 78,
    popularCategories: [
      { category: CourseCategory.NUTRITION, count: 2 },
      { category: CourseCategory.FITNESS, count: 0 },
    ],
    monthlyEnrollments: [
      { month: "Jan", count: 156 },
      { month: "Fev", count: 342 },
    ],
  },
  selectedCourse: null,
  selectedLesson: null,
  filters: {},
  loading: {
    courses: false,
    lessons: false,
    enrollments: false,
    progress: false,
    reviews: false,
    stats: false,
    creating: false,
    updating: false,
    deleting: false,
    enrolling: false,
  },
  error: null,
}

function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "SET_COURSES":
      return { ...state, courses: action.payload }
    case "SET_LESSONS":
      return { ...state, lessons: action.payload }
    case "SET_ENROLLMENTS":
      return { ...state, enrollments: action.payload }
    case "SET_PROGRESS":
      return { ...state, progress: action.payload }
    case "SET_REVIEWS":
      return { ...state, reviews: action.payload }
    case "SET_STATS":
      return { ...state, stats: action.payload }
    case "SET_SELECTED_COURSE":
      return { ...state, selectedCourse: action.payload }
    case "SET_SELECTED_LESSON":
      return { ...state, selectedLesson: action.payload }
    case "SET_FILTERS":
      return { ...state, filters: action.payload }
    case "ADD_COURSE":
      return { ...state, courses: [...state.courses, action.payload] }
    case "UPDATE_COURSE":
      return {
        ...state,
        courses: state.courses.map((course) => (course.id === action.payload.id ? action.payload : course)),
      }
    case "DELETE_COURSE":
      return {
        ...state,
        courses: state.courses.filter((course) => course.id !== action.payload),
      }
    case "ADD_LESSON":
      return { ...state, lessons: [...state.lessons, action.payload] }
    case "UPDATE_LESSON":
      return {
        ...state,
        lessons: state.lessons.map((lesson) => (lesson.id === action.payload.id ? action.payload : lesson)),
      }
    case "DELETE_LESSON":
      return {
        ...state,
        lessons: state.lessons.filter((lesson) => lesson.id !== action.payload),
      }
    case "ADD_ENROLLMENT":
      return { ...state, enrollments: [...state.enrollments, action.payload] }
    case "UPDATE_ENROLLMENT":
      return {
        ...state,
        enrollments: state.enrollments.map((enrollment) =>
          enrollment.id === action.payload.id ? action.payload : enrollment,
        ),
      }
    case "ADD_REVIEW":
      return { ...state, reviews: [...state.reviews, action.payload] }
    case "UPDATE_PROGRESS":
      return {
        ...state,
        progress: state.progress.map((p) =>
          p.courseId === action.payload.courseId && p.userId === action.payload.userId ? action.payload : p,
        ),
      }
    default:
      return state
  }
}

const CourseContext = createContext<{
  state: CourseState
  dispatch: React.Dispatch<CourseAction>
} | null>(null)

export function CourseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(courseReducer, initialState)

  return <CourseContext.Provider value={{ state, dispatch }}>{children}</CourseContext.Provider>
}

export function useCourseContext() {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider")
  }
  return context
}
