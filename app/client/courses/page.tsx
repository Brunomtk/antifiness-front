"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Eye, BookOpen, Filter, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCourses } from "@/hooks/use-course"
import { useCourseEnrollments } from "@/hooks/use-course"
import { useProgress } from "@/hooks/use-progress"
import { CourseProgressBar } from "@/components/course-progress-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import type { Course } from "@/types/course"
import { useUserContext } from "@/contexts/user-context"
import type { CourseProgressSummary } from "@/types/progress"

export default function ClientCourses() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [coursesProgress, setCoursesProgress] = useState<Record<number, CourseProgressSummary>>({})

  const { courses, loading: coursesLoading, error: coursesError, fetchCourses } = useCourses()
  const { enrollments, loading: enrollmentsLoading, fetchEnrollments, createEnrollment } = useCourseEnrollments()
  const { fetchProgress } = useProgress()
  const { toast } = useToast()

  // Normaliza estados de loading (objetos -> boolean)
  const isLoading = (coursesLoading && (coursesLoading as any).courses) || (enrollmentsLoading && (enrollmentsLoading as any).enrollments)



  // Simular userId - em produção viria do contexto de autenticação
  const { state } = useUserContext()
  const userId = state.currentUser?.id ?? 0
  const empresasId = state.currentUser?.empresaId ?? 0
  useEffect(() => {
    if (!empresasId) return;
    fetchCourses({
      page: 1,
      pageSize: 50,
      empresasId,
    })
    if (userId && empresasId) fetchEnrollments({ userId, empresasId })
  }, [fetchCourses, fetchEnrollments, userId, empresasId])

  // Buscar progresso para cada inscrição
  useEffect(() => {
    const loadProgress = async () => {
      for (const enrollment of enrollments) {
        try {
          const progress = await fetchProgress({
            userId,
            courseId: enrollment.courseId,
          })

          if (progress.length > 0) {
            const totalLessons = progress.length
            const completedLessons = progress.filter((p) => p.isCompleted).length
            const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
            const totalWatchTime = progress.reduce((sum, p) => sum + p.watchTimeMinutes, 0)
            const lastAccessedDate = progress.reduce(
              (latest, p) => (new Date(p.updatedDate) > new Date(latest) ? p.updatedDate : latest),
              progress[0].updatedDate,
            )

            setCoursesProgress((prev) => ({
              ...prev,
              [enrollment.courseId]: {
                courseId: enrollment.courseId,
                courseTitle: enrollment.courseTitle || "Curso",
                totalLessons,
                completedLessons,
                progressPercentage,
                totalWatchTime,
                lastAccessedDate,
                isCompleted: progressPercentage === 100,
              },
            }))
          }
        } catch (error) {
          console.error(`Erro ao carregar progresso do curso ${enrollment.courseId}:`, error)
        }
      }
    }

    if (enrollments.length > 0) {
      loadProgress()
    }
  }, [enrollments, fetchProgress, userId])

  const filteredCourses = courses.filter((course) => {
    const searchTermLower = searchTerm.toLowerCase()
    const titleLower = course.title.toLowerCase()
    const instructorLower = course.instructor.toLowerCase()

    const matchesSearch = titleLower.includes(searchTermLower) || instructorLower.includes(searchTermLower)
    const matchesCategory = categoryFilter === "all" || course.categoryName === categoryFilter

    return matchesSearch && matchesCategory
  })

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId))

  const getEnrolledCourses = () => {
    return filteredCourses.filter((course) => enrolledCourseIds.has(course.id))
  }

  const getInProgressCourses = () => {
    return getEnrolledCourses().filter((course) => {
      const progress = coursesProgress[course.id]
      return progress && progress.progressPercentage > 0 && progress.progressPercentage < 100
    })
  }

  const getCompletedCourses = () => {
    return getEnrolledCourses().filter((course) => {
      const progress = coursesProgress[course.id]
      return progress && progress.progressPercentage === 100
    })
  }

  const handleEnrollInCourse = async (course: Course) => {
    try {
      await createEnrollment({
        empresasId,
        courseId: course.id,
        userId,
        startDate: new Date().toISOString(),
      })

      toast({
        title: "Inscrição realizada!",
        description: `Você foi inscrito no curso "${course.title}"`,
      })

      // Recarregar inscrições
      if (userId && empresasId) fetchEnrollments({ userId, empresasId })
    } catch (error) {
      toast({
        title: "Erro na inscrição",
        description: "Não foi possível se inscrever no curso. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Gratuito"

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency === "BRL" ? "BRL" : "USD",
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-zinc-100 dark:bg-zinc-900">
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="aspect-video w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (coursesError) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Erro ao carregar cursos: {coursesError}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold md:text-2xl">Meus Cursos</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Buscar curso..."
            className="w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="icon" onClick={() => setIsFilterOpen(true)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="em-andamento" className="space-y-4">
        <TabsList>
          <TabsTrigger value="em-andamento">Em Andamento ({getInProgressCourses().length})</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos ({getCompletedCourses().length})</TabsTrigger>
          <TabsTrigger value="todos">Todos ({getEnrolledCourses().length})</TabsTrigger>
          <TabsTrigger value="disponiveis">
            Disponíveis ({filteredCourses.filter((c) => !enrolledCourseIds.has(c.id)).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="em-andamento" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getInProgressCourses().map((course) => (
              <Card key={course.id} className="bg-zinc-100 dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img
                    src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
                    alt={course.title}
                    className="rounded-md aspect-video object-cover"
                  />

                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{course.categoryName}</Badge>
                    <div className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(course.durationMinutes)}</span>
                      <Eye className="h-4 w-4" />
                      <span>{course.enrollmentsCount}</span>
                    </div>
                  </div>

                  {coursesProgress[course.id] && (
                    <CourseProgressBar progress={coursesProgress[course.id]} showDetails={false} />
                  )}

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(course.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">({course.reviewsCount})</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedCourse(course)
                      setIsVideoOpen(true)
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {getInProgressCourses().length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhum curso em andamento</h3>
              <p className="text-muted-foreground">Comece um novo curso para vê-lo aqui</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="concluidos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCompletedCourses().map((course) => (
              <Card key={course.id} className="bg-zinc-100 dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img
                    src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
                    alt={course.title}
                    className="rounded-md aspect-video object-cover"
                  />

                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{course.categoryName}</Badge>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      Concluído
                    </Badge>
                  </div>

                  {coursesProgress[course.id] && (
                    <CourseProgressBar progress={coursesProgress[course.id]} showDetails={false} />
                  )}

                  <Button className="w-full" variant="secondary">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Revisar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {getCompletedCourses().length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhum curso concluído</h3>
              <p className="text-muted-foreground">Complete seus cursos para vê-los aqui</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getEnrolledCourses().map((course) => (
              <Card key={course.id} className="bg-zinc-100 dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img
                    src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
                    alt={course.title}
                    className="rounded-md aspect-video object-cover"
                  />

                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{course.categoryName}</Badge>
                    <div className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(course.durationMinutes)}</span>
                    </div>
                  </div>

                  {coursesProgress[course.id] && (
                    <CourseProgressBar progress={coursesProgress[course.id]} showDetails={false} />
                  )}

                  <Button
                    className="w-full"
                    variant={coursesProgress[course.id]?.isCompleted ? "secondary" : "default"}
                    onClick={() => {
                      setSelectedCourse(course)
                      setIsVideoOpen(true)
                    }}
                  >
                    {coursesProgress[course.id]?.isCompleted ? (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Revisar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        {coursesProgress[course.id]?.progressPercentage > 0 ? "Continuar" : "Iniciar"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disponiveis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses
              .filter((course) => !enrolledCourseIds.has(course.id))
              .map((course) => (
                <Card key={course.id} className="bg-zinc-100 dark:bg-zinc-900">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={course.thumbnail || "/placeholder.svg?height=200&width=400"}
                      alt={course.title}
                      className="rounded-md aspect-video object-cover"
                    />

                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{course.categoryName}</Badge>
                      <div className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(course.durationMinutes)}</span>
                        <Eye className="h-4 w-4" />
                        <span>{course.enrollmentsCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(course.averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground">({course.reviewsCount})</span>
                      </div>
                      <span className="font-semibold text-lg">{formatPrice(course.price, course.currency)}</span>
                    </div>

                    <Button className="w-full" onClick={() => handleEnrollInCourse(course)}>
                      Inscrever-se
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>

          {filteredCourses.filter((course) => !enrolledCourseIds.has(course.id)).length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhum curso disponível</h3>
              <p className="text-muted-foreground">Todos os cursos já foram adquiridos</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Vídeo */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>{selectedCourse?.description}</DialogDescription>
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black rounded-lg">
            <video
              src="/placeholder-video.mp4"
              controls
              className="absolute inset-0 w-full h-full rounded-lg"
              poster={selectedCourse?.thumbnail}
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsVideoOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Filtros */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtrar Cursos</DialogTitle>
            <DialogDescription>Selecione as opções de filtro desejadas.</DialogDescription>
          </DialogHeader>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="Fitness">Fitness</SelectItem>
              <SelectItem value="Nutrition">Nutrição</SelectItem>
              <SelectItem value="Wellness">Bem-estar</SelectItem>
              <SelectItem value="Cooking">Culinária</SelectItem>
              <SelectItem value="Supplements">Suplementos</SelectItem>
              <SelectItem value="Psychology">Psicologia</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsFilterOpen(false)}>
              Aplicar Filtro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
