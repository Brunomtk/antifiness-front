"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Dumbbell, LineChart, BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { workoutService } from "@/services/workout-service"
import type { Workout } from "@/types/workout"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

const WorkoutForm = dynamic(() => import("@/components/workout/WorkoutForm"), { ssr: false })
const WorkoutProgress = dynamic(() => import("@/components/workout/WorkoutProgress"), { ssr: false })

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const [loading, setLoading] = React.useState(true)
  const [workout, setWorkout] = React.useState<Workout | null>(null)

  const load = async () => {
    try {
      const data = await workoutService.getById(id)
      setWorkout(data)
    } catch (err: any) {
      toast({ title: "Erro ao carregar treino", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { if (id) load() }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!workout) return null

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-3">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Link href="/admin/workouts" className="inline-flex items-center text-sm hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Link>
      <div className="text-xl font-semibold tracking-tight flex items-center gap-2">
        <Dumbbell className="h-5 w-5 opacity-70" />
        {workout?.name || "Treino"}
        <Badge variant="secondary" className="ml-2">
          {(() => {
            const map: Record<number, string> = {0: "Rascunho", 1: "Ativo", 2: "Concluído", 3: "Arquivado"}
            return map[workout?.status ?? 0] || "—"
          })()}
        </Badge>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={async () => { 
        await workoutService.changeStatus(workout.id, workout.status === 1 ? 2 : 1)
        toast({ title: "Status alterado" })
        load()
      }}>Alterar Status</Button>
    </div>
  </div>
  <div className="text-sm text-muted-foreground">
    {(workout?.exercises?.length || 0)} exercício(s){workout?.estimatedDuration ? ` • ${workout.estimatedDuration} min` : ""}{workout?.estimatedCalories ? ` • ${workout.estimatedCalories} kcal` : ""}
  </div>
</div>

<Tabs defaultValue="overview">
        <TabsList className="sticky top-16 z-10 w-full bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/40 border rounded-xl shadow-sm flex flex-wrap">
  <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
    <Dumbbell className="mr-2 h-4 w-4" /> Treino
  </TabsTrigger>
  <TabsTrigger value="progress" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
    <LineChart className="mr-2 h-4 w-4" /> Progresso
  </TabsTrigger>
</TabsList>

        <TabsContent value="overview" className="mt-4">
          <WorkoutForm mode="edit" initial={workout} workoutId={id} />
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <WorkoutProgress workout={workout} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
