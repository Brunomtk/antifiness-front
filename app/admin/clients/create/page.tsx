"use client"

import dynamic from "next/dynamic"
const ClientForm = dynamic(() => import("@/components/client/ClientForm"), { ssr: false })

export default function ClientCreatePage() {
  return (
    <div className="p-4 md:p-6">
      <ClientForm mode="create" />
    </div>
  )
}
