"use client"

import dynamic from "next/dynamic"
const WorkoutForm = dynamic(() => import("@/components/workout/WorkoutForm"), { ssr: false })

export default function WorkoutCreatePage() {
  return (
    <div className="p-4 md:p-6">
      <WorkoutForm mode="create" />
    </div>
  )
}
