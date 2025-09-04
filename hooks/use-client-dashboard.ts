"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { api } from "@/lib/api"

interface ClientStats {
  currentWeight: number
  goalWeight: number
  startWeight: number
  weightLoss: number
  progressPercentage: number
  adherence: number
  daysActive: number
  totalDays: number
  weeklyProgress: Array<{
    day: string
    completed: boolean
    adherence: number
  }>
}

interface RecentActivity {
  id: string
  type: "meal" | "workout" | "message" | "feedback"
  title: string
  time: string
  icon: string
  color: string
  bgColor: string
}

interface UpcomingTask {
  id: string
  title: string
  subtitle: string
  time: string
  type: "meal" | "workout"
  icon: string
}

interface ClientData {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  currentWeight: number
  targetWeight: number
  height: number
  goals: Array<{
    id: number
    type: number
    description: string
    targetValue: number
    targetDate: string
    priority: number
    status: number
  }>
  measurements: Array<{
    id: number
    date: string
    weight: number
    bodyFat: number
    muscleMass: number
    waist: number
    chest: number
    arms: number
    thighs: number
    notes: string
  }>
}

export function useClientDashboard() {
  const { currentUser } = useUser()
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([])
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateWeeklyProgress = (measurements: any[], diets: any[], workouts: any[]) => {
    const days = ["D", "S", "T", "Q", "Q", "S", "S"]
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))

    return days.map((day, index) => {
      const dayDate = new Date(weekStart)
      dayDate.setDate(weekStart.getDate() + index)

      const hasMeasurement = measurements.some((m) => {
        const measureDate = new Date(m.date)
        return measureDate.toDateString() === dayDate.toDateString()
      })

      const hasDietActivity = diets.some((d) => {
        const dietDate = new Date(d.updatedAt)
        return dietDate.toDateString() === dayDate.toDateString()
      })

      const hasWorkoutActivity = workouts.some((w) => {
        const workoutDate = new Date(w.updatedAt)
        return workoutDate.toDateString() === dayDate.toDateString()
      })

      const hasActivity = hasMeasurement || hasDietActivity || hasWorkoutActivity
      const adherence = hasActivity ? Math.floor(Math.random() * 20) + 80 : 0

      return {
        day,
        completed: hasActivity,
        adherence,
      }
    })
  }

  const calculateStats = (client: ClientData, diets: any[], workouts: any[]): ClientStats => {
    const measurements = client.measurements || []
    const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null

    const currentWeight = latestMeasurement?.weight || client.currentWeight || 0
    const targetWeight = client.targetWeight || 0

    const oldestMeasurement = measurements.length > 0 ? measurements[0] : null
    const startWeight = oldestMeasurement?.weight || currentWeight

    const weightLoss = Math.max(0, startWeight - currentWeight)
    const totalWeightToLose = Math.max(1, startWeight - targetWeight)
    const progressPercentage = totalWeightToLose > 0 ? Math.min(100, (weightLoss / totalWeightToLose) * 100) : 0

    const activeDiets = diets.filter((d) => d.status === 1).length
    const activeWorkouts = workouts.filter((w) => w.status === 1).length
    const totalActivities = activeDiets + activeWorkouts
    const adherence = totalActivities > 0 ? Math.min(100, (totalActivities / 5) * 100) : 0

    const currentDate = new Date()
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

    const activityDates = new Set()

    diets.forEach((diet) => {
      const date = new Date(diet.updatedAt).toDateString()
      activityDates.add(date)
    })

    workouts.forEach((workout) => {
      const date = new Date(workout.updatedAt).toDateString()
      activityDates.add(date)
    })

    measurements.forEach((measurement) => {
      const date = new Date(measurement.date).toDateString()
      activityDates.add(date)
    })

    const daysActive = activityDates.size

    return {
      currentWeight,
      goalWeight: targetWeight,
      startWeight,
      weightLoss,
      progressPercentage,
      adherence,
      daysActive,
      totalDays: daysInMonth,
      weeklyProgress: calculateWeeklyProgress(measurements, diets, workouts),
    }
  }

  const fetchDashboardData = async () => {
    console.log("🚀 === INÍCIO fetchDashboardData ===")
    console.log("👤 currentUser completo:", JSON.stringify(currentUser, null, 2))

    if (!currentUser) {
      console.log("❌ currentUser é null/undefined")
      setError("Usuário não está logado")
      setIsLoading(false)
      return
    }

    if (!currentUser.clientId) {
      console.log("❌ currentUser.clientId não existe")
      console.log("🔍 currentUser.id:", currentUser.id)
      console.log("🔍 currentUser.userType:", currentUser.userType)
      setError("Cliente não encontrado no usuário logado")
      setIsLoading(false)
      return
    }

    try {
      const clientId = currentUser.clientId
      if (!clientId) throw new Error('CLIENT_ID_MISSING')
      setIsLoading(true)
      setError(null)
      console.log("✅ ClientId confirmado:", clientId)
      console.log("🌐 URL que será chamada:", `/Client/${clientId}`)

      // Verificar se o clientId é válido
      if (!clientId || clientId <= 0) {
        throw new Error(`ClientId inválido: ${clientId}`)
      }

      console.log("📡 Fazendo requisição GET /Client/" + clientId)
      let client: ClientData | null = null
      try {
      if (!clientId) throw new Error('CLIENT_ID_MISSING')
        const clientResponse = await api.get(`/Client/${clientId}`)
        client = clientResponse.data as ClientData
        setClientData(client)
        console.log("✅ Cliente encontrado!")
      } catch (e: any) {
        if (e?.response?.status === 404) {
          console.warn("⚠️ Cliente não encontrado na API. Usando dados mínimos do usuário atual.")
          client = {
            id: clientId,
            name: currentUser.name || "Cliente",
            email: currentUser.email || "",
            phone: "",
            avatar: currentUser.avatar || "",
            activityLevel: "1",
            stage: "0",
            status: "Active",
            createdDate: new Date().toISOString(),
          } as any
          setClientData(client)
        } else {
          throw e
        }
      }
      console.log("👤 Nome:", client.name)
      console.log("📧 Email:", client.email)
      console.log("⚖️ Peso atual:", client.currentWeight)
      console.log("🎯 Peso meta:", client.targetWeight)

      // Buscar dados relacionados
      console.log("📡 Buscando dietas para clientId:", clientId)
      const dietResponse = await api.get(`/Diet`, {
        params: {
          clientId: clientId,
          pageNumber: 1,
          pageSize: 10,
        },
      })

      console.log("📡 Buscando treinos para ClientId:", clientId)
      const workoutResponse = await api.get(`/Workout`, {
        params: {
          ClientId: clientId,
          Page: 1,
          PageSize: 10,
        },
      })

      console.log("📡 Buscando feedbacks para ClientId:", clientId)
      const feedbackResponse = await api.get(`/Feedback`, {
        params: {
          ClientId: clientId,
          pageNumber: 1,
          pageSize: 5,
        },
      })

      const diets = dietResponse.data?.diets || []
      const workouts = workoutResponse.data?.workouts || []
      const feedbacks = feedbackResponse.data?.feedbacks || []

      console.log("📊 Dados coletados:")
      console.log("🍎 Dietas:", diets.length)
      console.log("💪 Treinos:", workouts.length)
      console.log("💬 Feedbacks:", feedbacks.length)

      // Calcular estatísticas
      const calculatedStats = calculateStats(client, diets, workouts)
      setStats(calculatedStats)

      // Processar atividades recentes
      const activities: RecentActivity[] = []

      diets.slice(0, 3).forEach((diet: any) => {
        activities.push({
          id: `diet-${diet.id}`,
          type: "meal",
          title: diet.name || "Plano Alimentar",
          time: new Date(diet.updatedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          icon: "Apple",
          color: "text-green-600",
          bgColor: "bg-green-50",
        })
      })

      workouts
        .filter((workout: any) => workout.clientId === clientId)
        .slice(0, 2)
        .forEach((workout: any) => {
          activities.push({
            id: `workout-${workout.id}`,
            type: "workout",
            title: workout.name || "Treino",
            time: new Date(workout.updatedAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            icon: "Dumbbell",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          })
        })

      feedbacks.slice(0, 2).forEach((feedback: any) => {
        activities.push({
          id: `feedback-${feedback.id}`,
          type: "feedback",
          title: feedback.title || "Feedback",
          time: new Date(feedback.createdDate).toLocaleDateString("pt-BR"),
          icon: "MessageSquare",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        })
      })

      setRecentActivities(activities)

      // Processar próximas tarefas
      const tasks: UpcomingTask[] = []

      const activeDiets = diets.filter((diet: any) => diet.status === 1)

      activeDiets.slice(0, 3).forEach((diet: any, index: number) => {
        const mealTimes = ["12:30", "15:30", "19:30"]
        const mealNames = ["Almoço", "Lanche da Tarde", "Jantar"]
        const mealDescriptions = [`${diet.dailyCalories || 0} kcal`, "Lanche saudável", "Refeição leve"]

        if (index < mealTimes.length) {
          tasks.push({
            id: `meal-${diet.id}-${index}`,
            title: mealNames[index],
            subtitle: mealDescriptions[index],
            time: mealTimes[index],
            type: "meal",
            icon: "Apple",
          })
        }
      })

      const activeWorkouts = workouts.filter((workout: any) => workout.clientId === clientId && workout.status === 1)

      activeWorkouts.slice(0, 2).forEach((workout: any) => {
        tasks.push({
          id: `workout-task-${workout.id}`,
          title: "Treino",
          subtitle: workout.name || "Exercícios programados",
          time: "07:00",
          type: "workout",
          icon: "Dumbbell",
        })
      })

      setUpcomingTasks(tasks)

      console.log("🎉 === DASHBOARD CARREGADO COM SUCESSO ===")
    } catch (err: any) {
      console.error("💥 === ERRO NO DASHBOARD ===")
      console.error("❌ Erro:", err.message)
      console.error("🌐 URL:", err.config?.url)
      console.error("📊 Status:", err.response?.status)
      console.error("📄 Response:", err.response?.data)

      let errorMessage = "Erro desconhecido"

      if (err.response?.status === 404) {
        // Já tratamos 404 do cliente com fallback; manter mensagem genérica
        errorMessage = `Dados não disponíveis no momento`
      } else if (err.message === 'CLIENT_ID_MISSING') {
        errorMessage = 'ID do cliente não encontrado. Faça login novamente.'
      } else if (err.response?.status === 401) {
        errorMessage = "Sessão expirada. Faça login novamente"
      } else if (err.response?.status === 403) {
        errorMessage = "Acesso negado aos dados do cliente"
      } else if (err.message) {
        errorMessage = `Erro: ${err.message}`
      }

      setError(errorMessage)
      setStats(null)
      setRecentActivities([])
      setUpcomingTasks([])

      console.log("💥 === FIM ERRO DASHBOARD ===")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("🔄 === useEffect Dashboard ===")
    console.log("👤 currentUser:", currentUser)
    console.log("🆔 clientId:", currentUser?.clientId)

    if (currentUser?.clientId) {
      console.log("✅ Iniciando fetchDashboardData")
      fetchDashboardData()
    } else if (currentUser && !currentUser.clientId) {
      console.log("❌ Usuário sem clientId")
      setError("Usuário não possui um cliente associado")
      setIsLoading(false)
    } else {
      console.log("⏳ Aguardando currentUser...")
    }
  }, [currentUser])

  return {
    stats,
    recentActivities,
    upcomingTasks,
    clientData,
    isLoading,
    error,
    refetch: fetchDashboardData,
  }
}
