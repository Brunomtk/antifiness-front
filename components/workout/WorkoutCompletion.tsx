"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Star, Share2, Trophy, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkoutCompletionProps {
  isOpen: boolean
  onClose: () => void
  workoutName: string
  startTime: string
  endTime: string
  duration: string
  onSubmit: (data: {
    rating: number
    mood: number
    energyLevel: number
    notes: string
  }) => void
  onShare?: () => void
}

export function WorkoutCompletion({
  isOpen,
  onClose,
  workoutName,
  startTime,
  endTime,
  duration,
  onSubmit,
  onShare,
}: WorkoutCompletionProps) {
  const [rating, setRating] = useState(5)
  const [mood, setMood] = useState(3)
  const [energyLevel, setEnergyLevel] = useState(5)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        rating,
        mood,
        energyLevel,
        notes,
      })
      onClose()
    } catch (error) {
      console.error("Erro ao enviar feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const moodOptions = [
    { value: 1, label: "Muito ruim", emoji: "😞" },
    { value: 2, label: "Ruim", emoji: "😕" },
    { value: 3, label: "Neutro", emoji: "😐" },
    { value: 4, label: "Bom", emoji: "😊" },
    { value: 5, label: "Excelente", emoji: "😄" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] mx-4">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full workout-success-gradient">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">Parabéns!</DialogTitle>
          <DialogDescription className="text-base">Você concluiu seu treino!</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Workout Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3 text-center">{workoutName}</h3>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Início:</div>
                  <div className="font-bold text-green-700">{startTime}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Fim:</div>
                  <div className="font-bold text-green-700">{endTime}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tempo de treino:</div>
                  <div className="font-bold text-green-700">{duration}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Form */}
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">Como você avalia esse treino?</label>
              <Select value={rating.toString()} onValueChange={(value) => setRating(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {value}/10
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mood */}
            <div>
              <label className="text-sm font-medium mb-2 block">Como você se sentiu durante o treino?</label>
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={mood === option.value ? "default" : "outline"}
                    className={cn(
                      "flex flex-col items-center gap-1 h-auto py-3",
                      mood === option.value && "workout-gradient text-white",
                    )}
                    onClick={() => setMood(option.value)}
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="text-sm font-medium mb-2 block">Nível de energia (1-10)</label>
              <Select value={energyLevel.toString()} onValueChange={(value) => setEnergyLevel(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        {value}/10
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Se quiser, deixe seu comentário aqui</label>
              <Textarea
                placeholder="Seu comentário aqui"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          {onShare && (
            <Button
              variant="outline"
              onClick={onShare}
              className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 workout-gradient hover:opacity-90 text-white"
          >
            {isSubmitting ? "Enviando..." : "Concluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
