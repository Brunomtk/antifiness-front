"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, Trash2, ArrowLeft } from "lucide-react"
import type { CreatePlanRequest, Plan } from "@/types/plan"
import { planStatusLabel, planTypeLabel } from "@/types/plan"
import { planService } from "@/services/plan-service"

const schema = z.object({
  name: z.string().min(2, "Informe um nome"),
  description: z.string().optional(),
  type: z.coerce.number().int().nonnegative(),
  duration: z.coerce.number().int().min(1, "Mínimo 1 dia"),
  targetCalories: z.coerce.number().optional(),
  targetWeight: z.coerce.number().optional(),
  clientId: z.coerce.number().optional(),
  nutritionistId: z.coerce.number().optional(),
  startDate: z.string().min(1, "Selecione a data de início"),
  notes: z.string().optional(),
})

export type PlanFormValues = z.infer<typeof schema>

type Props = {
  mode: "create" | "edit"
  initial?: Plan | null
  planId?: number
}

export default function PlanForm({ mode, initial, planId }: Props) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          description: initial.description ?? "",
          type: initial.type,
          duration: initial.duration,
          targetCalories: initial.targetCalories,
          targetWeight: initial.targetWeight,
          clientId: initial.clientId,
          nutritionistId: initial.nutritionistId,
          startDate: initial.startDate?.slice(0, 16),
          notes: initial.notes ?? "",
        }
      : {
          name: "",
          description: "",
          type: 0,
          duration: 30,
          targetCalories: undefined,
          targetWeight: undefined,
          clientId: undefined,
          nutritionistId: undefined,
          startDate: new Date().toISOString().slice(0, 16),
          notes: "",
        },
  })

  useEffect(() => {
    if (!initial) return
    setValue("name", initial.name)
    setValue("description", initial.description ?? "")
    setValue("type", initial.type)
    setValue("duration", initial.duration)
    setValue("targetCalories", initial.targetCalories)
    setValue("targetWeight", initial.targetWeight)
    setValue("clientId", initial.clientId)
    setValue("nutritionistId", initial.nutritionistId)
    setValue("startDate", initial.startDate?.slice(0, 16))
    setValue("notes", initial.notes ?? "")
  }, [initial, setValue])

  const onSubmit = async (values: PlanFormValues) => {
    const payload: CreatePlanRequest = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      type: Number(values.type),
      duration: Number(values.duration),
      targetCalories: values.targetCalories != null ? Number(values.targetCalories) : undefined,
      targetWeight: values.targetWeight != null ? Number(values.targetWeight) : undefined,
      clientId: values.clientId != null ? Number(values.clientId) : undefined,
      nutritionistId: values.nutritionistId != null ? Number(values.nutritionistId) : undefined,
      startDate: new Date(values.startDate).toISOString(),
      notes: values.notes?.trim() || undefined,
      goals: undefined,
      meals: undefined,
      progressEntries: undefined,
    }

    try {
      if (mode === "create") {
        const created = await planService.create(payload)
        toast({ title: "Plano criado", description: `#${created.id} • ${created.name}` })
      } else if (mode === "edit" && planId) {
        await planService.update(planId, payload)
        toast({ title: "Plano atualizado", description: `#${planId} atualizado com sucesso.` })
      }
      router.push("/admin/plans")
    } catch (error: any) {
      const message = error?.response?.data || error?.message || "Erro ao salvar plano"
      toast({ title: "Falha", description: String(message) })
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!planId) return
    const ok = confirm("Confirma excluir este plano?")
    if (!ok) return
    try {
      await planService.remove(planId)
      toast({ title: "Plano excluído", description: `#${planId} removido.` })
      router.push("/admin/plans")
    } catch (error: any) {
      const message = error?.response?.data || error?.message || "Erro ao excluir"
      toast({ title: "Falha", description: String(message) })
    }
  }

  return (
    <Card className="border-none shadow-lg bg-gradient-to-b from-background to-muted/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <CardTitle className="text-xl font-semibold">
          {mode === "create" ? "Novo Plano" : initial ? `Editar Plano #${initial?.id}` : "Editar Plano"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Plano Cutting" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              onValueChange={(v) => setValue("type", Number(v))}
              defaultValue={String(initial?.type ?? 0)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3].map((t) => (
                  <SelectItem key={`plan-type-${t}`} value={String(t)}>
                    {planTypeLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (dias)</Label>
            <Input id="duration" type="number" min={1} {...register("duration", { valueAsNumber: true })} />
            {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Início</Label>
            <Input id="startDate" type="datetime-local" {...register("startDate")} />
            {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetCalories">Calorias alvo (kcal)</Label>
            <Input id="targetCalories" type="number" {...register("targetCalories", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetWeight">Peso alvo (kg)</Label>
            <Input id="targetWeight" type="number" step="0.1" {...register("targetWeight", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente (ID)</Label>
            <Input id="clientId" type="number" min={1} {...register("clientId", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nutritionistId">Nutricionista (ID)</Label>
            <Input id="nutritionistId" type="number" min={1} {...register("nutritionistId", { valueAsNumber: true })} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={3} placeholder="Detalhes gerais do plano" {...register("description")} />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" rows={3} placeholder="Observações importantes" {...register("notes")} />
          </div>

          {mode === "edit" && initial && (
            <div className="md:col-span-2 text-sm text-muted-foreground">
              <span className="inline-block mr-4">Status: <b>{planStatusLabel(initial.status)}</b></span>
              <span className="inline-block">Criado em: {new Date(initial.createdAt).toLocaleString()}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
          {mode === "edit" ? (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
          ) : (
            <div />
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Salvar
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
