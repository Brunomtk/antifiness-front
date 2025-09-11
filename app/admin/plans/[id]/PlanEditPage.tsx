"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { planService } from "@/services/plan-service"
import type { Plan } from "@/types/plan"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

const PlanForm = dynamic(() => import("@/components/plan/PlanForm"), { ssr: false })

export default function PlanEditPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<Plan | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const data = await planService.getById(id)
        setPlan(data)
      } catch (error: any) {
        const message = error?.response?.data || error?.message || "Erro ao carregar plano"
        toast({ title: "Falha", description: String(message) })
      } finally {
        setLoading(false)
      }
    }
    if (id) run()
  }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <PlanForm mode="edit" initial={plan} planId={id} />
    </div>
  )
}
