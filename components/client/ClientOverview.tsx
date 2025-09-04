"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { clientService } from "@/services/client-service"

type Props = { clientId: number }

export default function ClientOverview({ clientId }: Props) {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<any>(null)

  // (Opcional) cálculo de IMC, mantido para uso futuro
  const bmi = React.useMemo(() => {
    const w = Number(data?.currentWeight)
    const hCm = Number(data?.height)
    if (!Number.isFinite(w) || !Number.isFinite(hCm) || hCm <= 0) return null
    const h = hCm / 100
    const val = w / (h * h)
    return Number.isFinite(val) ? Number(val.toFixed(1)) : null
  }, [data])

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const basic = await clientService.getBasic(clientId)
        setData(basic)
      } finally {
        setLoading(false)
      }
    }
    if (clientId) run()
  }, [clientId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">Sem dados básicos.</div>
  }

  // Campos derivados
  const name = data?.name ?? `#${clientId}`
  const email = data?.email ?? "-"
  const phone = data?.phone ?? "-"
  const avatar = data?.avatar ?? ""
  const activity = data?.activityLevel ?? "-"
  const stage = data?.kanbanStage ?? "-"
  const status = data?.status ?? "-"
  const created = data?.createdDate ? new Date(data.createdDate).toLocaleString() : "-"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{String(name).slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
            <div className="text-xs text-muted-foreground">{phone}</div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Atividade:</span>
            <Badge variant="secondary">{`Nível ${activity}`}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Etapa:</span>
            <Badge>{`Etapa ${stage}`}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge>{String(status)}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">Criado em: {created}</div>
        </CardContent>
      </Card>

      {/* Resumo rápido */}
      <Card>
        <CardHeader><CardTitle>Resumo rápido</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div>Altura: {data?.height ?? "-"} cm</div>
          <div>Peso atual: {data?.currentWeight ?? "-"} kg</div>
          <div>Peso alvo: {data?.targetWeight ?? "-"} kg</div>
          <div>IMC: {bmi ?? "-"}</div>
          <div>Observações: {data?.notes ?? "-"}</div>
        </CardContent>
      </Card>
    </div>
  )
}
