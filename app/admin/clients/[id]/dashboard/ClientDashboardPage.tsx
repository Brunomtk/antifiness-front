"use client"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ClientOverview from "@/components/client/ClientOverview"
import DietSection from "@/components/client/DietSection"
import WorkoutSection from "@/components/client/WorkoutSection"
import ProgressSection from "@/components/client/ProgressSection"
import AchievementsSection from "@/components/client/AchievementsSection"

export default function ClientDashboardPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="text-xl font-semibold">Cliente #{id}</div>
        <div />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="diet">Dieta</TabsTrigger>
          <TabsTrigger value="workout">Treino</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ClientOverview clientId={id} />
        </TabsContent>

        <TabsContent value="diet" className="mt-4">
          <DietSection clientId={id} />
        </TabsContent>

        <TabsContent value="workout" className="mt-4">
          <WorkoutSection clientId={id} />
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <ProgressSection clientId={id} />
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <AchievementsSection clientId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
