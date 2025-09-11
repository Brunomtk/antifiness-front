"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { clientService } from "@/services/client-service"
import { Users, UserCheck, UserX, PauseCircle, TrendingUp, Percent } from "lucide-react"

type Props = { className?: string }

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

  React.useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const s = Object.fromEntries(Object.entries(stats || {}).map(([k, v]) => [String(k).toLowerCase(), v]))

  const items = [
    {
      key: "totalclients",
      label: "Total de Clientes",
      value: pretty(s["totalclients"]),
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-white/20",
    },
    {
      key: "activeclients",
      label: "Clientes Ativos",
      value: pretty(s["activeclients"]),
      icon: UserCheck,
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-white/20",
    },
    {
      key: "inactiveclients",
      label: "Clientes Inativos",
      value: pretty(s["inactiveclients"]),
      icon: UserX,
      gradient: "from-gray-500 to-gray-600",
      iconBg: "bg-white/20",
    },
    {
      key: "pausedclients",
      label: "Clientes Pausados",
      value: pretty(s["pausedclients"]),
      icon: PauseCircle,
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-white/20",
    },
    {
      key: "newclientsthismonth",
      label: "Novos este Mês",
      value: pretty(s["newclientsthismonth"]),
      icon: TrendingUp,
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-white/20",
    },
    {
      key: "retentionrate",
      label: "Taxa de Retenção",
      value: (() => {
        const val = pretty(s["retentionrate"])
        const pct = val <= 1 ? Math.round(val * 100) : Math.round(val)
        return pct
      })(),
      suffix: "%",
      icon: Percent,
      gradient: "from-cyan-500 to-cyan-600",
      iconBg: "bg-white/20",
    },
  ].filter((it) => it.value != null)

  if (items.length === 0) return null

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}>
      {items.map(({ key, label, value, icon: Icon, suffix, gradient, iconBg }) => (
        <Card
          key={key}
          className={`relative overflow-hidden border-none shadow-lg bg-gradient-to-br ${gradient} text-white hover:shadow-xl transition-all duration-300`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {value}
                  {suffix && <span className="text-lg ml-1">{suffix}</span>}
                </p>
              </div>
              <div className={`p-3 rounded-full ${iconBg}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
