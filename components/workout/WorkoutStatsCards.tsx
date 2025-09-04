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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full" />))}
      </div>
    )
  }

  const items = [
    { key: "totalWorkouts", label: "Treinos", val: s.totalWorkouts ?? 0, icon: Dumbbell },
    { key: "completedWorkouts", label: "Concluídos", val: s.completedWorkouts ?? 0, icon: CheckSquare },
    { key: "templateWorkouts", label: "Modelos", val: s.templateWorkouts ?? 0, icon: FilePlus },
    { key: "totalExercises", label: "Exercícios", val: s.totalExercises ?? 0, icon: Layers },
    { key: "averageRating", label: "Avaliação", val: s.averageRating ?? 0, icon: Star },
    { key: "completionRate", label: "Conclusão", val: (s.completionRate ?? 0), icon: Flame, suffix: "%" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ key, label, val, icon: Icon, suffix }) => (
        <Card key={key} className="shadow-sm border-none bg-gradient-to-b from-muted/30 to-background hover:from-muted/40">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
              <Icon className="h-4 w-4 opacity-60" />
            </div>
            <div className="mt-1 text-2xl font-semibold">{val}{suffix ? <span className="text-base ml-1">{suffix}</span> : null}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
