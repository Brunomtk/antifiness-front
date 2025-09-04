"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { clientService } from "@/services/client-service"

type Props = { clientId: number }

export default function AchievementsSection({ clientId }: Props) {
  const [submitting, setSubmitting] = React.useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const title = (form.elements.namedItem("title") as HTMLInputElement).value
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value || undefined
    const type = (form.elements.namedItem("type") as HTMLInputElement).value || undefined
    const category = (form.elements.namedItem("category") as HTMLInputElement).value || undefined
    if (!title) { toast({ title: "Informe um título" }); return }
    try {
      setSubmitting(true)
      await clientService.postAchievement(clientId, { title, description, type, category })
      toast({ title: "Conquista adicionada" })
      form.reset()
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Adicionar conquista</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Título</Label>
            <Input name="title" placeholder="Ex.: -5kg em 30 dias" />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input name="type" placeholder="Ex.: meta, marco, prêmio" />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Input name="category" placeholder="Ex.: peso, treino, dieta" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descrição</Label>
            <Textarea name="description" rows={3} placeholder="Detalhes opcionais" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting}>Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
