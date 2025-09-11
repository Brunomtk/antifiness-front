"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { clientService } from "@/services/client-service"
import { companyService } from "@/services/company-service"
import {
  User,
  Mail,
  Phone,
  Activity,
  Target,
  Weight,
  Ruler,
  Calendar,
  FileText,
  TrendingUp,
  Building2,
  UserCheck,
} from "lucide-react"

type Props = { clientId: number }

export default function ClientOverview({ clientId }: Props) {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<any>(null)
  const [companyName, setCompanyName] = React.useState<string>("")
  const [clientName, setClientName] = React.useState<string>("")

  const bmi = React.useMemo(() => {
    const w = Number(data?.currentWeight)
    const hCm = Number(data?.height)
    if (!Number.isFinite(w) || !Number.isFinite(hCm) || hCm <= 0) return null
    const h = hCm / 100
    const val = w / (h * h)
    return Number.isFinite(val) ? Number(val.toFixed(1)) : null
  }, [data])

  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return { label: "-", color: "bg-gray-500" }
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "bg-blue-500" }
    if (bmi < 25) return { label: "Normal", color: "bg-green-500" }
    if (bmi < 30) return { label: "Sobrepeso", color: "bg-yellow-500" }
    return { label: "Obesidade", color: "bg-red-500" }
  }

  const getActivityLevelLabel = (level: number) => {
    const labels = ["Sedentária", "Leve", "Moderada", "Ativa", "Muito Ativa"]
    return labels[level] || "Não definido"
  }

  const getKanbanStageLabel = (stage: number) => {
    const labels = ["Lead", "Prospect", "Ativo", "Inativo", "Concluído"]
    return labels[stage] || "Não definido"
  }

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const basic = await clientService.getBasic(clientId)
        setData(basic)

        if (basic?.empresaId) {
          try {
            const company = await companyService.getCompany(basic.empresaId)
            setCompanyName(company.name)
          } catch (error) {
            console.warn("Erro ao buscar empresa:", error)
            setCompanyName(`Empresa #${basic.empresaId}`)
          }
        }

        if (clientId) {
          try {
            const client = await clientService.getById(clientId)
            setClientName(client.name)
          } catch (error) {
            console.warn("Erro ao buscar cliente:", error)
            setClientName(`Cliente #${clientId}`)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    if (clientId) run()
  }, [clientId])

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">Sem dados básicos.</div>
  }

  const name = data?.name ?? `#${clientId}`
  const email = data?.email ?? "-"
  const phone = data?.phone ?? "-"
  const avatar = data?.avatar ?? ""
  const activity = data?.activityLevel ?? 0
  const stage = data?.kanbanStage ?? 0
  const status = data?.status ?? 0
  const created = data?.createdDate ? new Date(data.createdDate).toLocaleDateString() : "-"
  const bmiCategory = getBMICategory(bmi)

  return (
    <div className="space-y-6">
      {/* Perfil do Cliente - Full Width */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Perfil do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-blue-200">
              <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                {String(name).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="font-semibold text-gray-900 text-xl">{name}</div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Mail className="h-3 w-3" />
                {email}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                {phone}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded-full">
              <Calendar className="h-3 w-3" />
              Cliente desde {created}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Atividade - Full Width */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Activity className="h-5 w-5" />
            Status & Atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">Nível de Atividade:</span>
              <Badge className="bg-green-500 hover:bg-green-600 text-white">{getActivityLevelLabel(activity)}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">Etapa Kanban:</span>
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white">{getKanbanStageLabel(stage)}</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">Status Geral:</span>
              <Badge className="bg-purple-500 hover:bg-purple-600 text-white">Status {status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Físicas - Full Width */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 shadow-lg w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Weight className="h-5 w-5" />
            Métricas Físicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                <Ruler className="h-3 w-3" />
                Altura
              </div>
              <div className="font-bold text-2xl text-gray-900">{data?.height || "-"}</div>
              <div className="text-xs text-gray-500">cm</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                <Weight className="h-3 w-3" />
                Peso Atual
              </div>
              <div className="font-bold text-2xl text-gray-900">{data?.currentWeight || "-"}</div>
              <div className="text-xs text-gray-500">kg</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                <Target className="h-3 w-3" />
                Meta
              </div>
              <div className="font-bold text-2xl text-gray-900">{data?.targetWeight || "-"}</div>
              <div className="text-xs text-gray-500">kg</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                <TrendingUp className="h-3 w-3" />
                IMC
              </div>
              <div className="font-bold text-2xl text-gray-900">{bmi || "-"}</div>
              {bmi && <Badge className={`${bmiCategory.color} text-white text-xs mt-2`}>{bmiCategory.label}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Pessoais - Full Width */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 shadow-lg w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <FileText className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">Gênero:</span>
              <span className="font-semibold text-gray-900">
                {data?.gender === "M" ? "Masculino" : data?.gender === "F" ? "Feminino" : "Não informado"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">Nascimento:</span>
              <span className="font-semibold text-gray-900">
                {data?.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "Não informado"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">Objetivo:</span>
              <span className="font-semibold text-gray-900">{data?.goalType || "Não definido"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais - Full Width */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200 shadow-lg w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-teal-800">
            <Building2 className="h-5 w-5" />
            Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">Nome do Cliente:</span>
              </div>
              <span className="font-semibold text-gray-900">{clientName || "Carregando..."}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">Empresa:</span>
              </div>
              <span className="font-semibold text-gray-900">{companyName || "Carregando..."}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações - Full Width if exists */}
      {data?.notes && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 shadow-lg w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <FileText className="h-5 w-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-base">{data.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
