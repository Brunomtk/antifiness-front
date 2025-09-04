import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CRMLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 min-h-[600px]">
        {Array.from({ length: 5 }).map((_, stageIndex) => (
          <div key={stageIndex} className="flex flex-col">
            {/* Header da coluna */}
            <div className="bg-gray-200 p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-5 w-8" />
              </div>
              <Skeleton className="h-4 w-32 mt-1" />
            </div>

            {/* Cards dos clientes */}
            <div className="bg-gray-100 flex-1 p-4 rounded-b-lg space-y-3 min-h-[500px]">
              {Array.from({ length: Math.floor(Math.random() * 4) + 1 }).map((_, cardIndex) => (
                <Card key={cardIndex} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32 mb-1" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <div className="flex justify-between mb-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
