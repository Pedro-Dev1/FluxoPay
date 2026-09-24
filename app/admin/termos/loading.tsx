import { Skeleton } from "@/components/ui/skeleton"

export default function AdminTermosLoading() {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="border border-border rounded-lg divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <Skeleton className="h-4 w-40 mb-3" />
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="border border-border rounded-lg divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
