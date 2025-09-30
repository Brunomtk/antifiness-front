"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseWorkoutTimerReturn {
  // Timer state
  totalTime: number
  restTime: number
  isRunning: boolean
  isResting: boolean

  // Timer controls
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  startRest: (duration: number) => void
  skipRest: () => void

  // Formatted time strings
  formatTotalTime: () => string
  formatRestTime: () => string

  // Timer status
  isTimerActive: boolean
}

export function useWorkoutTimer(): UseWorkoutTimerReturn {
  const [totalTime, setTotalTime] = useState(0)
  const [restTime, setRestTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isResting, setIsResting] = useState(false)

  const totalIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Total workout timer
  useEffect(() => {
    if (isRunning && !isResting) {
      totalIntervalRef.current = setInterval(() => {
        setTotalTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (totalIntervalRef.current) {
        clearInterval(totalIntervalRef.current)
        totalIntervalRef.current = null
      }
    }

    return () => {
      if (totalIntervalRef.current) {
        clearInterval(totalIntervalRef.current)
      }
    }
  }, [isRunning, isResting])

  // Rest timer
  useEffect(() => {
    if (isResting && restTime > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
        restIntervalRef.current = null
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
      }
    }
  }, [isResting, restTime])

  const start = useCallback(() => {
    setIsRunning(true)
    setIsResting(false)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resume = useCallback(() => {
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    setIsResting(false)
    setTotalTime(0)
    setRestTime(0)
  }, [])

  const startRest = useCallback((duration: number) => {
    setIsResting(true)
    setRestTime(duration)
  }, [])

  const skipRest = useCallback(() => {
    setIsResting(false)
    setRestTime(0)
  }, [])

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
    }
    return `${minutes}m ${secs.toString().padStart(2, "0")}s`
  }, [])

  const formatTotalTime = useCallback(() => formatTime(totalTime), [totalTime, formatTime])
  const formatRestTime = useCallback(() => formatTime(restTime), [restTime, formatTime])

  const isTimerActive = isRunning || isResting

  return {
    totalTime,
    restTime,
    isRunning,
    isResting,
    start,
    pause,
    resume,
    stop,
    startRest,
    skipRest,
    formatTotalTime,
    formatRestTime,
    isTimerActive,
  }
}
