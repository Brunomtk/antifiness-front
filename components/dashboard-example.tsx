"use client"

import { useEffect } from "react"
import { useApp } from "@/hooks/use-app"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardExample() {
  const { dashboard, client, user } = useApp()

  useEffect(() => {
    // Carregar dados do dashboard
    dashboard.fetchDashboardData()
    client.fetchClients()
    user.fetchProfile()
  }, [])

  if (dashboard.loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.stats?.totalClients || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.stats?.activeClients || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {dashboard.stats?.monthlyRevenue?.toLocaleString() || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.stats?.averageClientSatisfaction || 0}/5</div>
        </CardContent>
      </Card>
    </div>
  )
}
