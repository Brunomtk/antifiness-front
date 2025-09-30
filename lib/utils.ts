import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeStringToTicks(value: string): number {
  // accepts "HH:mm" or "HH:mm:ss"
  const parts = value.split(":").map((x) => Number.parseInt(x, 10) || 0)
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  const s = parts[2] ?? 0
  const totalSeconds = h * 3600 + m * 60 + s
  return totalSeconds * 10_000_000 // 1s = 10,000,000 ticks
}

export function ticksToTimeString(ticks: number): string {
  const totalSeconds = Math.floor(ticks / 10_000_000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}
