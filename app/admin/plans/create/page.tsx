"use client"

import dynamic from "next/dynamic"
const PlanForm = dynamic(() => import("@/components/plan/PlanForm"), { ssr: false })

export default function PlanCreatePage() {
  return (
    <div className="p-4 md:p-6">
      <PlanForm mode="create" />
    </div>
  )
}
