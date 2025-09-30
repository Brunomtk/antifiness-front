"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Play, Pause, Square, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkoutTimerProps {
  totalTime: number
  restTime: number
  isRunning: boolean
  isResting: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onSkipRest: () => void
  formatTotalTime: () => string
  formatRestTime: () => string
  className?: string
}

export function WorkoutTimer({
  totalTime,
  restTime,
  isRunning,
  isResting,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkipRest,
  formatTotalTime,
  formatRestTime,
  className,
}: WorkoutTimerProps) {
  return (
    <Card className={cn("workout-card-shadow border-0", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Timer Display */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                isResting ? "bg-orange-100 text-orange-800" : "workout-timer-gradient text-white",
              )}
            >
              <Clock className={cn("h-4 w-4", isRunning && !isResting && "animate-timer-pulse")} />
              <span className="font-mono font-bold text-lg">{isResting ? formatRestTime() : formatTotalTime()}</span>
            </div>

            {isResting && <div className="text-sm text-orange-600 font-medium">Intervalo</div>}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            {!isRunning && totalTime === 0 ? (
              <Button onClick={onStart} size="sm" className="workout-success-gradient hover:opacity-90 text-white">
                <Play className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button
                    onClick={onPause}
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={onResume} size="sm" className="workout-success-gradient hover:opacity-90 text-white">
                    <Play className="h-4 w-4" />
                  </Button>
                )}

                {isResting && (
                  <Button
                    onClick={onSkipRest}
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  onClick={onStop}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
