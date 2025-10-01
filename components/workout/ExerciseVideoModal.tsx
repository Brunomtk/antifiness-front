"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Play, Loader2, AlertCircle } from "lucide-react"
import { exerciseService } from "@/services/exercise-service"
import type { Exercise } from "@/types/exercise"

interface ExerciseVideoModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  exerciseId: number | null
}

export function ExerciseVideoModal({ isOpen, onOpenChange, exerciseId }: ExerciseVideoModalProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && exerciseId) {
      loadExercise()
    }
  }, [isOpen, exerciseId])

  const loadExercise = async () => {
    if (!exerciseId) return

    setLoading(true)
    setError(null)

    try {
      const data = await exerciseService.getById(exerciseId)
      setExercise(data)
    } catch (err: any) {
      console.error("Failed to load exercise:", err)
      setError("Falha ao carregar informações do exercício")
    } finally {
      setLoading(false)
    }
  }

  const getVideoEmbedUrl = (url: string): string | null => {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
    const match = url.match(youtubeRegex)

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }

    // If it's already an embed URL or other video URL, return as is
    if (url.includes("embed") || url.includes(".mp4") || url.includes(".webm")) {
      return url
    }

    return null
  }

  const renderVideoContent = () => {
    if (loading) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500">Carregando vídeo...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="aspect-video bg-red-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )
    }

    if (!exercise?.mediaUrls || exercise.mediaUrls.length === 0) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Vídeo não disponível</p>
          </div>
        </div>
      )
    }

    const videoUrl = exercise.mediaUrls[0]
    const embedUrl = getVideoEmbedUrl(videoUrl)

    if (!embedUrl) {
      return (
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Formato de vídeo não suportado</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Abrir vídeo em nova aba
            </a>
          </div>
        </div>
      )
    }

    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`Vídeo: ${exercise.name}`}
        />
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] mx-4">
        <DialogHeader>
          <DialogTitle>{exercise?.name || "Vídeo do Exercício"}</DialogTitle>
          <DialogDescription>
            {exercise?.description || "Assista ao vídeo demonstrativo do exercício."}
          </DialogDescription>
        </DialogHeader>
        {renderVideoContent()}
        {exercise?.instructions && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">📋 Instruções</h4>
            <p className="text-sm text-blue-800">{exercise.instructions}</p>
          </div>
        )}
        {exercise?.tips && (
          <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-sm text-green-900 mb-2">💡 Dicas</h4>
            <p className="text-sm text-green-800">{exercise.tips}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
