"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react"
import type { Client, CreateClientRequest } from "@/types/client"
import { clientService } from "@/services/client-service"

const schema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  height: z.coerce.number().optional(),
  currentWeight: z.coerce.number().optional(),
  targetWeight: z.coerce.number().optional(),
  activityLevel: z.coerce.number().optional(),
  kanbanStage: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
  empresaId: z.coerce.number().optional(),
  notes: z.string().optional(),
})

export type ClientFormValues = z.infer<typeof schema>

type Props = {
  mode: "create" | "edit"
  initial?: Client | null
  clientId?: number
}

export default function ClientForm({ mode, initial, clientId }: Props) {
  const router = useRouter()
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(initial?.avatar || null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          email: initial.email || "",
          phone: initial.phone || "",
          avatar: initial.avatar || "",
          dateOfBirth: initial.dateOfBirth?.slice(0, 10),
          gender: String(initial.gender || ""),
          height: initial.height,
          currentWeight: initial.currentWeight,
          targetWeight: initial.targetWeight,
          activityLevel: initial.activityLevel,
          kanbanStage: initial.kanbanStage,
          status: (initial as any).status as any,
          empresaId: (initial as any).empresaId as any,
          notes: initial.notes || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          avatar: "",
          dateOfBirth: "",
          gender: "",
          height: undefined,
          currentWeight: undefined,
          targetWeight: undefined,
          activityLevel: undefined,
          kanbanStage: undefined,
          status: undefined,
          empresaId: undefined,
          notes: "",
        },
  })

  const watchAvatar = avatarPreview || watch("avatar")

  const onSubmit = async (values: ClientFormValues) => {
    const payload: CreateClientRequest = {
      ...values,
      avatar: watchAvatar || undefined,
      dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
      gender: values.gender || undefined,
      notes: values.notes?.trim() || undefined,
    }
    try {
      if (mode === "create") {
        const created = await clientService.create(payload)
        toast({ title: "Cliente criado", description: `#${created.id} • ${created.name}` })
      } else if (mode === "edit" && clientId) {
        await clientService.update(clientId, payload)
        toast({ title: "Cliente atualizado", description: `#${clientId} atualizado com sucesso.` })
      }
      router.push("/admin/clients")
    } catch (error: any) {
      const message = error?.response?.data || error?.message || "Erro ao salvar cliente"
      toast({ title: "Falha", description: String(message) })
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!clientId) return
    const ok = confirm("Confirma excluir este cliente?")
    if (!ok) return
    try {
      await clientService.remove(clientId)
      toast({ title: "Cliente excluído", description: `#${clientId} removido.` })
      router.push("/admin/clients")
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
          {mode === "create" ? "Novo Cliente" : initial ? `Editar Cliente #${initial?.id}` : "Editar Cliente"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Nome completo" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <Label>Foto</Label>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={watchAvatar || ""} alt="avatar" />
                <AvatarFallback>CL</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    const dataUrl = String(reader.result || "")
                    setValue("avatar", dataUrl, { shouldDirty: true })
                    setAvatarPreview(dataUrl)
                  }
                  reader.readAsDataURL(file)
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="email@exemplo.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="+55 11 99999-9999" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Nascimento</Label>
            <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gênero</Label>
            <Select onValueChange={(v) => setValue("gender", v)} defaultValue={String(initial?.gender || "")}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {["Male","Female","Other"].map((g) => (
                  <SelectItem key={`gender-${g}`} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input id="height" type="number" step="0.1" {...register("height", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentWeight">Peso atual (kg)</Label>
            <Input id="currentWeight" type="number" step="0.1" {...register("currentWeight", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetWeight">Peso alvo (kg)</Label>
            <Input id="targetWeight" type="number" step="0.1" {...register("targetWeight", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">Atividade</Label>
            <Select onValueChange={(v) => setValue("activityLevel", Number(v))} defaultValue={initial?.activityLevel != null ? String(initial.activityLevel) : ""}>
              <SelectTrigger id="activityLevel">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sedentária</SelectItem>
<SelectItem value="1">Leve</SelectItem>
<SelectItem value="2">Moderada</SelectItem>
<SelectItem value="3">Ativa</SelectItem>
<SelectItem value="4">Muito ativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kanbanStage">Etapa (Kanban)</Label>
            <Select onValueChange={(v) => setValue("kanbanStage", Number(v))} defaultValue={initial?.kanbanStage != null ? String(initial.kanbanStage) : ""}>
              <SelectTrigger id="kanbanStage">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Lead</SelectItem>
<SelectItem value="1">Prospect</SelectItem>
<SelectItem value="2">Ativo</SelectItem>
<SelectItem value="3">Inativo</SelectItem>
<SelectItem value="4">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status (resumido)</Label>
            <Select onValueChange={(v) => setValue("status", Number(v))} defaultValue={(initial as any)?.status != null ? String((initial as any).status) : ""}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { v: 1, l: "Ativo" },
                  { v: 2, l: "Inativo" },
                  { v: 0, l: "Lead" },
                  { v: 3, l: "Bloq." },
                ].map(({ v, l }) => (
                  <SelectItem key={`st-${v}`} value={String(v)}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" rows={3} placeholder="Anotações relevantes" {...register("notes")} />
          </div>
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
