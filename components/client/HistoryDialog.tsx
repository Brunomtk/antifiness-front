"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { clientService } from "@/services/client-service"
import type { ClientHistoryItem } from "@/types/client"

type Props = {
  clientId: number | null
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function HistoryDialog({ clientId, open, onOpenChange }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<ClientHistoryItem[]>([])

  React.useEffect(() => {
    const run = async () => {
      if (!open || !clientId) return
      try {
        setLoading(true)
        const res = await clientService.getHistory(clientId)
        setItems(res || [])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [open, clientId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico do Cliente</DialogTitle>
          <DialogDescription>Eventos e alterações recentes.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[420px] pr-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div key={`hist-${it.id}`} className="space-y-1">
                  <div className="text-sm font-medium">{it.type} • {new Date(it.createdDate).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{it.description}</div>
                  <Separator className="my-2" />
                </div>
              ))}
              {items.length === 0 && <div className="text-sm text-muted-foreground">Sem eventos.</div>}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
