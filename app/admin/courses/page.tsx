"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Clock,
  Eye,
  FileText,
  Video,
  Users,
  Star,
  DollarSign,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { useCourses } from "@/hooks/use-course"
import { CourseCategory, CourseLevel, CourseStatus, type CreateCourseData, type UpdateCourseData } from "@/types/course"
import { useToast } from "@/hooks/use-toast"

export default function CoursesPage() {
  const {
    courses,
    coursesResponse,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    selectCourse,
    selectedCourse,
  } = useCourses()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Novo curso
  const [newCourse, setNewCourse] = useState<CreateCourseData>({
    title: "",
    description: "",
    thumbnail: "",
    instructor: "",
    category: CourseCategory.FITNESS,
    level: CourseLevel.BEGINNER,
    durationMinutes: 0,
    price: 0,
    currency: "BRL",
    tags: [],
    empresasId: 1, // TODO: Get from user context
  })

  // Curso sendo editado
  const [editingCourse, setEditingCourse] = useState<UpdateCourseData | null>(null)

  // Carregar cursos na montagem
  useEffect(() => {
    fetchCourses({ page: 1, pageSize: 50 })
  }, [fetchCourses])

  // Filtrar cursos
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || course.category.toString() === categoryFilter
    const matchesStatus = statusFilter === "all" || course.status.toString() === statusFilter
    const matchesLevel = levelFilter === "all" || course.level.toString() === levelFilter

    return matchesSearch && matchesCategory && matchesStatus && matchesLevel
  })

  // Adicionar curso
  const handleAddCourse = async () => {
    try {
      await createCourse(newCourse)
      setNewCourse({
        title: "",
        description: "",
        thumbnail: "",
        instructor: "",
        category: CourseCategory.FITNESS,
        level: CourseLevel.BEGINNER,
        durationMinutes: 0,
        price: 0,
        currency: "BRL",
        tags: [],
        empresasId: 1,
      })
      setIsAddCourseOpen(false)
      toast({
        title: "Sucesso",
        description: "Curso criado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar curso. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Excluir curso
  const handleDeleteCourse = async () => {
    if (courseToDelete) {
      try {
        await deleteCourse(courseToDelete)
        setCourseToDelete(null)
        setIsDeleteDialogOpen(false)
        toast({
          title: "Sucesso",
          description: "Curso excluído com sucesso!",
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir curso. Tente novamente.",
          variant: "destructive",
        })
      }
    }
  }

  // Publicar/Despublicar curso
  const toggleCourseStatus = async (courseId: number, currentStatus: number) => {
    try {
      if (currentStatus === CourseStatus.DRAFT) {
        await publishCourse(courseId)
        toast({
          title: "Sucesso",
          description: "Curso publicado com sucesso!",
        })
      } else {
        // Para despublicar, atualizamos o status para draft
        const course = courses.find((c) => c.id === courseId)
        if (course) {
          await updateCourse(courseId, {
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            instructor: course.instructor,
            category: course.category,
            level: course.level,
            durationMinutes: course.durationMinutes,
            price: course.price,
            currency: course.currency,
            tags: course.tags,
            status: CourseStatus.DRAFT,
          })
          toast({
            title: "Sucesso",
            description: "Curso despublicado com sucesso!",
          })
        }
      }
      // Recarregar cursos
      fetchCourses({ page: 1, pageSize: 50 })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do curso. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Abrir modal de vídeo
  const handlePlayVideo = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId)
    if (course) {
      selectCourse(course)
      setIsVideoModalOpen(true)
    }
  }

  // Editar curso
  const handleEditCourse = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId)
    if (course) {
      setEditingCourse({
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        category: course.category,
        level: course.level,
        durationMinutes: course.durationMinutes,
        price: course.price,
        currency: course.currency,
        tags: course.tags,
        status: course.status,
      })
      selectCourse(course)
      setIsEditCourseOpen(true)
    }
  }

  // Salvar curso editado
  const handleSaveEditedCourse = async () => {
    if (editingCourse && selectedCourse) {
      try {
        await updateCourse(selectedCourse.id, editingCourse)
        setIsEditCourseOpen(false)
        setEditingCourse(null)
        selectCourse(null)
        toast({
          title: "Sucesso",
          description: "Curso atualizado com sucesso!",
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar curso. Tente novamente.",
          variant: "destructive",
        })
      }
    }
  }

  // Ver detalhes do curso
  const handleViewDetails = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId)
    if (course) {
      selectCourse(course)
      setIsDetailsModalOpen(true)
    }
  }

  // Aplicar filtros
  const handleApplyFilters = () => {
    const filters: any = { page: 1, pageSize: 50 }

    if (searchTerm) filters.search = searchTerm
    if (categoryFilter !== "all") filters.category = Number.parseInt(categoryFilter)
    if (statusFilter !== "all") filters.status = Number.parseInt(statusFilter)
    if (levelFilter !== "all") filters.level = Number.parseInt(levelFilter)

    fetchCourses(filters)
    setIsFilterOpen(false)
  }

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setLevelFilter("all")
    fetchCourses({ page: 1, pageSize: 50 })
  }

  const getCategoryName = (category: number) => {
    switch (category) {
      case CourseCategory.FITNESS:
        return "Fitness"
      case CourseCategory.NUTRITION:
        return "Nutrição"
      case CourseCategory.WELLNESS:
        return "Bem-estar"
      case CourseCategory.COOKING:
        return "Culinária"
      case CourseCategory.SUPPLEMENTS:
        return "Suplementação"
      case CourseCategory.PSYCHOLOGY:
        return "Psicologia"
      case CourseCategory.BUSINESS:
        return "Negócios"
      default:
        return "Outros"
    }
  }

  const getLevelName = (level: number) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return "Iniciante"
      case CourseLevel.INTERMEDIATE:
        return "Intermediário"
      case CourseLevel.ADVANCED:
        return "Avançado"
      case CourseLevel.ALL_LEVELS:
        return "Todos os níveis"
      default:
        return "Não definido"
    }
  }

  const getStatusName = (status: number) => {
    switch (status) {
      case CourseStatus.DRAFT:
        return "Rascunho"
      case CourseStatus.PUBLISHED:
        return "Publicado"
      case CourseStatus.ARCHIVED:
        return "Arquivado"
      case CourseStatus.PRIVATE:
        return "Privado"
      default:
        return "Não definido"
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case CourseStatus.PUBLISHED:
        return "bg-green-500"
      case CourseStatus.DRAFT:
        return "bg-yellow-500"
      case CourseStatus.ARCHIVED:
        return "bg-gray-500"
      case CourseStatus.PRIVATE:
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryColor = (category: number) => {
    switch (category) {
      case CourseCategory.FITNESS:
        return "border-purple-500 text-purple-500"
      case CourseCategory.NUTRITION:
        return "border-green-500 text-green-500"
      case CourseCategory.WELLNESS:
        return "border-teal-500 text-teal-500"
      case CourseCategory.COOKING:
        return "border-orange-500 text-orange-500"
      case CourseCategory.SUPPLEMENTS:
        return "border-blue-500 text-blue-500"
      case CourseCategory.PSYCHOLOGY:
        return "border-pink-500 text-pink-500"
      case CourseCategory.BUSINESS:
        return "border-indigo-500 text-indigo-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center py-8">
          <p className="text-red-500">Erro ao carregar cursos: {error}</p>
          <Button onClick={() => fetchCourses({ page: 1, pageSize: 50 })} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cursos e Vídeos</h1>
          <p className="text-muted-foreground">Gerencie o conteúdo educacional para seus clientes</p>
        </div>

        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsAddCourseOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Curso
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Cursos Disponíveis</CardTitle>
          {coursesResponse && (
            <p className="text-sm text-muted-foreground">
              {coursesResponse.totalCount} curso(s) encontrado(s) - Página {coursesResponse.page} de{" "}
              {coursesResponse.totalPages}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cursos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleApplyFilters}>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>

              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filtrar Cursos</DialogTitle>
                    <DialogDescription>Selecione os filtros desejados para a lista de cursos.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category-filter" className="text-right">
                        Categoria
                      </Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Filtrar por categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value={CourseCategory.FITNESS.toString()}>Fitness</SelectItem>
                          <SelectItem value={CourseCategory.NUTRITION.toString()}>Nutrição</SelectItem>
                          <SelectItem value={CourseCategory.WELLNESS.toString()}>Bem-estar</SelectItem>
                          <SelectItem value={CourseCategory.COOKING.toString()}>Culinária</SelectItem>
                          <SelectItem value={CourseCategory.SUPPLEMENTS.toString()}>Suplementação</SelectItem>
                          <SelectItem value={CourseCategory.PSYCHOLOGY.toString()}>Psicologia</SelectItem>
                          <SelectItem value={CourseCategory.BUSINESS.toString()}>Negócios</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="level-filter" className="text-right">
                        Nível
                      </Label>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Filtrar por nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value={CourseLevel.BEGINNER.toString()}>Iniciante</SelectItem>
                          <SelectItem value={CourseLevel.INTERMEDIATE.toString()}>Intermediário</SelectItem>
                          <SelectItem value={CourseLevel.ADVANCED.toString()}>Avançado</SelectItem>
                          <SelectItem value={CourseLevel.ALL_LEVELS.toString()}>Todos os níveis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status-filter" className="text-right">
                        Status
                      </Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value={CourseStatus.PUBLISHED.toString()}>Publicado</SelectItem>
                          <SelectItem value={CourseStatus.DRAFT.toString()}>Rascunho</SelectItem>
                          <SelectItem value={CourseStatus.ARCHIVED.toString()}>Arquivado</SelectItem>
                          <SelectItem value={CourseStatus.PRIVATE.toString()}>Privado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Limpar Filtros
                    </Button>
                    <Button onClick={handleApplyFilters} className="bg-green-600 hover:bg-green-700">
                      Aplicar Filtros
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Nível</TableHead>
                  <TableHead className="hidden md:table-cell">Duração</TableHead>
                  <TableHead className="hidden md:table-cell">Inscrições</TableHead>
                  <TableHead className="hidden md:table-cell">Avaliação</TableHead>
                  <TableHead className="hidden md:table-cell">Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.courses ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Carregando cursos...
                    </TableCell>
                  </TableRow>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">{course.instructor}</div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {course.durationMinutes}min | {course.enrollmentsCount} inscrições
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(course.category)}>
                          {getCategoryName(course.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{getLevelName(course.level)}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          {course.durationMinutes}min
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Users className="mr-1 h-3 w-3 text-muted-foreground" />
                          {course.enrollmentsCount}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Star className="mr-1 h-3 w-3 text-muted-foreground" />
                          {course.averageRating.toFixed(1)} ({course.reviewsCount})
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3 text-muted-foreground" />
                          {course.price > 0 ? `${course.currency} ${course.price.toFixed(2)}` : "Gratuito"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className={getStatusColor(course.status)}>
                          {getStatusName(course.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handlePlayVideo(course.id)}>
                            <Play className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(course.id)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCourse(course.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar Curso
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleCourseStatus(course.id, course.status)}>
                                {course.status === CourseStatus.PUBLISHED ? (
                                  <>
                                    <Eye className="mr-2 h-4 w-4 text-red-500" />
                                    <span className="text-red-500">Despublicar</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4 text-green-500" />
                                    <span className="text-green-500">Publicar</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => {
                                  setCourseToDelete(course.id)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir Curso
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Nenhum curso encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de adicionar curso */}
      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Curso</DialogTitle>
            <DialogDescription>Preencha os dados do novo curso. Clique em salvar quando terminar.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructor" className="text-right">
                Instrutor
              </Label>
              <Input
                id="instructor"
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Select
                value={newCourse.category.toString()}
                onValueChange={(value) => setNewCourse({ ...newCourse, category: Number.parseInt(value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CourseCategory.FITNESS.toString()}>Fitness</SelectItem>
                  <SelectItem value={CourseCategory.NUTRITION.toString()}>Nutrição</SelectItem>
                  <SelectItem value={CourseCategory.WELLNESS.toString()}>Bem-estar</SelectItem>
                  <SelectItem value={CourseCategory.COOKING.toString()}>Culinária</SelectItem>
                  <SelectItem value={CourseCategory.SUPPLEMENTS.toString()}>Suplementação</SelectItem>
                  <SelectItem value={CourseCategory.PSYCHOLOGY.toString()}>Psicologia</SelectItem>
                  <SelectItem value={CourseCategory.BUSINESS.toString()}>Negócios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">
                Nível
              </Label>
              <Select
                value={newCourse.level.toString()}
                onValueChange={(value) => setNewCourse({ ...newCourse, level: Number.parseInt(value) })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CourseLevel.BEGINNER.toString()}>Iniciante</SelectItem>
                  <SelectItem value={CourseLevel.INTERMEDIATE.toString()}>Intermediário</SelectItem>
                  <SelectItem value={CourseLevel.ADVANCED.toString()}>Avançado</SelectItem>
                  <SelectItem value={CourseLevel.ALL_LEVELS.toString()}>Todos os níveis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duração (min)
              </Label>
              <Input
                id="duration"
                type="number"
                value={newCourse.durationMinutes}
                onChange={(e) => setNewCourse({ ...newCourse, durationMinutes: Number.parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Preço
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newCourse.price}
                onChange={(e) => setNewCourse({ ...newCourse, price: Number.parseFloat(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="thumbnail" className="text-right">
                Thumbnail URL
              </Label>
              <Input
                id="thumbnail"
                value={newCourse.thumbnail}
                onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                className="col-span-3"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCourse} className="bg-green-600 hover:bg-green-700" disabled={loading.creating}>
              {loading.creating ? "Salvando..." : "Salvar Curso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={loading.deleting}>
              {loading.deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualização de vídeo */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>{selectedCourse?.description}</DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
            <div className="flex h-full flex-col items-center justify-center">
              <Video className="h-16 w-16 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Vídeo não disponível na versão de demonstração</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsVideoModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edição de curso */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>Edite os dados do curso. Clique em salvar quando terminar.</DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Título
                </Label>
                <Input
                  id="edit-title"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-instructor" className="text-right">
                  Instrutor
                </Label>
                <Input
                  id="edit-instructor"
                  value={editingCourse.instructor}
                  onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Categoria
                </Label>
                <Select
                  value={editingCourse.category.toString()}
                  onValueChange={(value) => setEditingCourse({ ...editingCourse, category: Number.parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseCategory.FITNESS.toString()}>Fitness</SelectItem>
                    <SelectItem value={CourseCategory.NUTRITION.toString()}>Nutrição</SelectItem>
                    <SelectItem value={CourseCategory.WELLNESS.toString()}>Bem-estar</SelectItem>
                    <SelectItem value={CourseCategory.COOKING.toString()}>Culinária</SelectItem>
                    <SelectItem value={CourseCategory.SUPPLEMENTS.toString()}>Suplementação</SelectItem>
                    <SelectItem value={CourseCategory.PSYCHOLOGY.toString()}>Psicologia</SelectItem>
                    <SelectItem value={CourseCategory.BUSINESS.toString()}>Negócios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-level" className="text-right">
                  Nível
                </Label>
                <Select
                  value={editingCourse.level.toString()}
                  onValueChange={(value) => setEditingCourse({ ...editingCourse, level: Number.parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseLevel.BEGINNER.toString()}>Iniciante</SelectItem>
                    <SelectItem value={CourseLevel.INTERMEDIATE.toString()}>Intermediário</SelectItem>
                    <SelectItem value={CourseLevel.ADVANCED.toString()}>Avançado</SelectItem>
                    <SelectItem value={CourseLevel.ALL_LEVELS.toString()}>Todos os níveis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-duration" className="text-right">
                  Duração (min)
                </Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editingCourse.durationMinutes}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, durationMinutes: Number.parseInt(e.target.value) || 0 })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Preço
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingCourse.price}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, price: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-thumbnail" className="text-right">
                  Thumbnail URL
                </Label>
                <Input
                  id="edit-thumbnail"
                  value={editingCourse.thumbnail}
                  onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                  className="col-span-3"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCourseOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditedCourse}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading.updating}
            >
              {loading.updating ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes do curso */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>Detalhes completos do curso</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Informações básicas */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Instrutor</Label>
                    <p className="text-sm">{selectedCourse.instructor}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                    <p className="text-sm">{getCategoryName(selectedCourse.category)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nível</Label>
                    <p className="text-sm">{getLevelName(selectedCourse.level)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant="default" className={getStatusColor(selectedCourse.status)}>
                      {getStatusName(selectedCourse.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Métricas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{selectedCourse.durationMinutes}min</p>
                          <p className="text-xs text-muted-foreground">Duração</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{selectedCourse.enrollmentsCount}</p>
                          <p className="text-xs text-muted-foreground">Inscrições</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{selectedCourse.averageRating.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">{selectedCourse.reviewsCount} avaliações</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {selectedCourse.price > 0
                              ? `${selectedCourse.currency} ${selectedCourse.price.toFixed(2)}`
                              : "Gratuito"}
                          </p>
                          <p className="text-xs text-muted-foreground">Preço</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Descrição */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Descrição</h3>
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              </div>

              {/* Tags */}
              {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações do sistema */}
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Informações do Sistema</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ID do Curso</Label>
                    <p className="text-sm">{selectedCourse.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Empresa ID</Label>
                    <p className="text-sm">{selectedCourse.empresasId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
                    <p className="text-sm">{new Date(selectedCourse.createdDate).toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Atualizado em</Label>
                    <p className="text-sm">{new Date(selectedCourse.updatedDate).toLocaleString("pt-BR")}</p>
                  </div>
                  {selectedCourse.publishedDate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Publicado em</Label>
                      <p className="text-sm">{new Date(selectedCourse.publishedDate).toLocaleString("pt-BR")}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Aulas</Label>
                    <p className="text-sm">{selectedCourse.lessonsCount} aula(s)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                setIsDetailsModalOpen(false)
                if (selectedCourse) {
                  handleEditCourse(selectedCourse.id)
                }
              }}
            >
              Editar Curso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
