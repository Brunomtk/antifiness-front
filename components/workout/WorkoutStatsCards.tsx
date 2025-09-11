"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { workoutService } from "@/services/workout-service"
import { Dumbbell, Star, Flame, CheckSquare, FilePlus, Layers } from "lucide-react"

export default function WorkoutStatsCards({ empresaId, clientId }: { empresaId?: number; clientId?: number }) {
  const [loading, setLoading] = React.useState(true)
  const [s, setS] = React.useState<any>({})

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const stats = await workoutService.getStats({ empresaId, clientId })
        setS(stats || {})
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [empresaId, clientId])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const items = [
    {
      key: "totalWorkouts",
      label: "Total de Treinos",
      val: s.totalWorkouts ?? 0,
      icon: Dumbbell,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      key: "completedWorkouts",
      label: "Treinos Concluídos",
      val: s.completedWorkouts ?? 0,
      icon: CheckSquare,
      gradient: "from-green-500 to-green-600",
    },
    {
      key: "templateWorkouts",
      label: "Modelos de Treino",
      val: s.templateWorkouts ?? 0,
      icon: FilePlus,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      key: "totalExercises",
      label: "Total de Exercícios",
      val: s.totalExercises ?? 0,
      icon: Layers,
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      key: "averageRating",
      label: "Avaliação Média",
      val: s.averageRating ?? 0,
      icon: Star,
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      key: "completionRate",
      label: "Taxa de Conclusão",
      val: s.completionRate ?? 0,
      icon: Flame,
      suffix: "%",
      gradient: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {items.map(({ key, label, val, icon: Icon, suffix, gradient }) => (
        <Card key={key} className="overflow-hidden border-0 shadow-lg">
          <CardContent className={`p-4 bg-gradient-to-br ${gradient} text-white relative`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold mt-1">
                  {val}
                  {suffix && <span className="text-lg ml-1">{suffix}</span>}
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-2">
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
