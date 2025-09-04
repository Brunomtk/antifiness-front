"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { clientService } from "@/services/client-service"
import { Users, UserCheck, UserX, PauseCircle, TrendingUp, Percent } from "lucide-react"

type Props = { className?: string }

const numColor = (key: string) => ({  totalclients: "",  activeclients: "text-green-600",  inactiveclients: "text-gray-500",  pausedclients: "text-slate-500",  growth: "text-blue-600",  conversion: "text-violet-600",}[key as any] || "");

const pretty = (n: any) => {
  if (n == null || n !== n) return 0
  if (typeof n === "string" && n.trim() === "") return 0
  return Number(n)
}

export default function StatsCards({ className }: Props) {
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<Record<string, any> | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const s = await clientService.getStats()
      setStats(s || {})
    } catch (err) {
      console.warn("Falha ao carregar stats:", err)
      setStats({})
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { fetchStats() }, [])

  if (loading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ""}`}>
        {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full" />))}
      </div>
    )
  }

  const s = Object.fromEntries(Object.entries(stats || {}).map(([k, v]) => [String(k).toLowerCase(), v]))

  // Select only the main/compact metrics; ignore null/undefined
  const items = [
    {
      key: "totalclients",
      label: "Clientes",
      value: pretty(s["totalclients"]),
      icon: Users,
    },
    {
      key: "activeclients",
      label: "Ativos",
      value: pretty(s["activeclients"]),
      icon: UserCheck,
    },
    {
      key: "inactiveclients",
      label: "Inativos",
      value: pretty(s["inactiveclients"]),
      icon: UserX,
    },
    {
      key: "pausedclients",
      label: "Pausados",
      value: pretty(s["pausedclients"]),
      icon: PauseCircle,
    },
    {
      key: "newclientsthismonth",
      label: "Novos (mês)",
      value: pretty(s["newclientsthismonth"]),
      icon: TrendingUp,
    },
    {
      key: "retentionrate",
      label: "Retenção",
      value: (() => {
        const val = pretty(s["retentionrate"])
        // If backend returns fraction (0..1), convert to percent
        const pct = val <= 1 ? Math.round(val * 100) : Math.round(val)
        return pct
      })(),
      suffix: "%",
      icon: Percent,
    },
  ].filter((it) => it.value != null)

  if (items.length === 0) return null

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ""}`}>
      {items.map(({ key, label, value, icon: Icon, suffix }) => (
        <Card
          key={key}
          className="shadow-sm border-none bg-gradient-to-b from-muted/30 to-background hover:from-muted/40 transition-colors"
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
              <Icon className="h-4 w-4 opacity-60" />
            </div>
            <div className="mt-1 text-2xl font-semibold"><span className={`\${numColor(key)} `}>{value}</span>{suffix ? <span className="text-base align-super ml-1">{suffix}</span> : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
