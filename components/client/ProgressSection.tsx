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

export default function ProgressSection({ clientId }: Props) {
  const [submitting, setSubmitting] = React.useState(false)
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)

  const submitWeight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const date = (form.elements.namedItem("wdate") as HTMLInputElement).value
    const weight = Number((form.elements.namedItem("weight") as HTMLInputElement).value)
    const notes = (form.elements.namedItem("wnotes") as HTMLTextAreaElement).value || undefined
    if (!date || !weight) { toast({ title: "Preencha data e peso" }); return }
    try {
      setSubmitting(true)
      await clientService.postWeight(clientId, { date: new Date(date).toISOString(), weight, notes })
      toast({ title: "Peso registrado" })
      form.reset()
    } catch (err: any) {
      toast({ title: "Erro ao registrar peso", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setSubmitting(false)
    }
  }

  const submitMeas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const date = (form.elements.namedItem("mdate") as HTMLInputElement).value
    const bodyFat = parseFloat((form.elements.namedItem("bodyFat") as HTMLInputElement).value || "0") || undefined
    const muscleMass = parseFloat((form.elements.namedItem("muscleMass") as HTMLInputElement).value || "0") || undefined
    const waist = parseFloat((form.elements.namedItem("waist") as HTMLInputElement).value || "0") || undefined
    const chest = parseFloat((form.elements.namedItem("chest") as HTMLInputElement).value || "0") || undefined
    const arms = parseFloat((form.elements.namedItem("arms") as HTMLInputElement).value || "0") || undefined
    const thighs = parseFloat((form.elements.namedItem("thighs") as HTMLInputElement).value || "0") || undefined
    const notes = (form.elements.namedItem("mnotes") as HTMLTextAreaElement).value || undefined
    if (!date) { toast({ title: "Preencha a data" }); return }
    try {
      setSubmitting(true)
      await clientService.postMeasurements(clientId, {
        date: new Date(date).toISOString(), bodyFat, muscleMass, waist, chest, arms, thighs, notes
      })
      toast({ title: "Medidas registradas" })
      form.reset()
    } catch (err: any) {
      toast({ title: "Erro ao registrar medidas", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setSubmitting(false)
    }
  }

  const submitPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const date = (form.elements.namedItem("pdate") as HTMLInputElement).value
    const notes = (form.elements.namedItem("pnotes") as HTMLTextAreaElement).value || undefined
    const image = photoPreview
    if (!date || !image) { toast({ title: "Selecione data e foto" }); return }
    try {
      setSubmitting(true)
      await clientService.postPhoto(clientId, { date: new Date(date).toISOString(), image, notes })
      toast({ title: "Foto enviada" })
      form.reset()
      setPhotoPreview(null)
    } catch (err: any) {
      toast({ title: "Erro ao enviar foto", description: String(err?.response?.data || err?.message || err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Peso */}
      <Card>
        <CardHeader><CardTitle>Registrar Peso</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitWeight} className="space-y-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input name="wdate" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input name="weight" type="number" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea name="wnotes" rows={2} />
            </div>
            <Button type="submit" disabled={submitting}>Salvar</Button>
          </form>
        </CardContent>
      </Card>

      {/* Medidas */}
      <Card>
        <CardHeader><CardTitle>Registrar Medidas</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitMeas} className="space-y-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input name="mdate" type="date" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>BF %</Label><Input name="bodyFat" type="number" step="0.1" /></div>
              <div><Label>Massa Musc. (kg)</Label><Input name="muscleMass" type="number" step="0.1" /></div>
              <div><Label>Cintura (cm)</Label><Input name="waist" type="number" step="0.1" /></div>
              <div><Label>Peito (cm)</Label><Input name="chest" type="number" step="0.1" /></div>
              <div><Label>Braços (cm)</Label><Input name="arms" type="number" step="0.1" /></div>
              <div><Label>Coxas (cm)</Label><Input name="thighs" type="number" step="0.1" /></div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea name="mnotes" rows={2} />
            </div>
            <Button type="submit" disabled={submitting}>Salvar</Button>
          </form>
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card>
        <CardHeader><CardTitle>Enviar Foto</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitPhoto} className="space-y-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input name="pdate" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Imagem</Label>
              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setPhotoPreview(String(reader.result || ""))
                reader.readAsDataURL(file)
              }} />
              {photoPreview && <img src={photoPreview} alt="preview" className="h-24 rounded-md border" />}
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea name="pnotes" rows={2} />
            </div>
            <Button type="submit" disabled={submitting}>Enviar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
