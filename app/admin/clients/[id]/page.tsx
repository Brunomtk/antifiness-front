"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { clientService } from "@/services/client-service"
import type { Client } from "@/types/client"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ClientOverview from "@/components/client/ClientOverview"
import DietSection from "@/components/client/DietSection"
import WorkoutSection from "@/components/client/WorkoutSection"
import ProgressSection from "@/components/client/ProgressSection"
import AchievementsSection from "@/components/client/AchievementsSection"
const ClientForm = dynamic(() => import("@/components/client/ClientForm"), { ssr: false })

export default function ClientEditPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const [loading, setLoading] = React.useState(true)
  const [client, setClient] = React.useState<Client | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  React.useEffect(() => {
    const run = async () => {
      try {
        const data = await clientService.getById(id)
        setClient(data)
      } catch (error: any) {
        const message = error?.response?.data || error?.message || "Erro ao carregar cliente"
        toast({ title: "Falha", description: String(message) })
      } finally {
        setLoading(false)
      }
    }
    if (id) run()
  }, [id])

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#edit") {
      setEditOpen(true)
    }
  }, [])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xl">
            {(client?.name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{client?.name || "Cliente"}</h1>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              {client?.email ? <span>{client.email}</span> : null}
              {client?.phone ? <span>• {client.phone}</span> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Kanban badge */}
          {(() => {
            const v = (client as any)?.kanbanStage
            const labelMap: any = { 0: "Lead", 1: "Prospect", 2: "Ativo", 3: "Inativo", 4: "Concluído" }
            const clsMap: any = {
              0: "bg-amber-500/90",
              1: "bg-blue-500/90",
              2: "bg-green-600/90",
              3: "bg-gray-500/90",
              4: "bg-violet-600/90",
            }
            const label = labelMap[v as keyof typeof labelMap] ?? "-"
            const cls = clsMap[v as keyof typeof clsMap] ?? "bg-muted"
            return <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${cls}`}>{label}</span>
          })()}
          {/* Activity chip */}
          {(() => {
            const v = (client as any)?.activityLevel
            const labelMap: any = { 0: "Sedentária", 1: "Leve", 2: "Moderada", 3: "Ativa", 4: "Muito ativa" }
            const label = labelMap[v as keyof typeof labelMap] ?? null
            return label ? <span className="px-3 py-1 rounded-full bg-muted text-xs">{label}</span> : null
          })()}
          <div className="hidden md:block w-px h-6 bg-border mx-1" />
          <button
            onClick={() => window.location.assign(`/admin/diets/create?clientId=${id}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Nova Dieta
          </button>
          <button
            onClick={() => window.location.assign(`/admin/workouts/create?clientId=${id}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Novo Treino
          </button>
          <a
            href={`/admin/clients/${id}#edit`}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            Editar
          </a>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diets">Dietas</TabsTrigger>
          <TabsTrigger value="workouts">Treinos</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="attachments">Anexos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {/* Info cards / medidas / resumo */}
              <ClientOverview clientId={id} />
            </div>
            <div className="lg:col-span-1 space-y-4">
              {/* Quick profile card */}
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-4 border-b">
                  <div className="text-sm font-medium">Perfil rápido</div>
                </div>
                <div className="p-4 text-sm space-y-2">
                  <div>
                    <span className="text-muted-foreground">Criado em:</span>{" "}
                    {client?.createdDate ? new Date(client.createdDate).toLocaleDateString() : "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Objetivo:</span> {(client as any)?.goalType ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Empresa:</span> {(client as any)?.empresaId ?? "-"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Notas:</span> {(client as any)?.notes || "-"}
                  </div>
                </div>
              </div>
              {/* Edit form collapsed */}
              <details
                id="edit"
                open={editOpen}
                onToggle={(e) => setEditOpen(e.currentTarget.open)}
                className="rounded-xl border bg-card shadow-sm"
              >
                <summary className="cursor-pointer p-4 text-sm font-medium">Editar informações</summary>
                <div className="p-4">
                  <ClientForm mode="edit" initial={client} clientId={id} />
                </div>
              </details>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="diets">
          <DietSection clientId={id} />
        </TabsContent>

        <TabsContent value="workouts">
          <WorkoutSection clientId={id} />
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid grid-cols-1 gap-4">
            <ProgressSection clientId={id} />
            <AchievementsSection clientId={id} />
          </div>
        </TabsContent>

        <TabsContent value="attachments">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 text-sm text-muted-foreground">
            Área de anexos do cliente (em breve). Você poderá adicionar e visualizar documentos, exames, fotos de
            avaliação etc.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
