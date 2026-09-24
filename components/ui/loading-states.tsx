import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// DESIGN_SYSTEM.md §28. Esqueleto com a forma do conteúdo final; nunca
// spinner de página inteira quando só uma área está carregando.

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2" aria-hidden="true">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 8, columns = 5, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)} aria-hidden="true">
      <div className="flex h-9 items-center gap-4 border-b border-border bg-surface px-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={cn("h-2.5", i === 0 ? "w-32" : "w-16")} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-11 items-center gap-4 border-b border-border-subtle px-3 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={cn("h-3", c === 0 ? "w-40" : c === columns - 1 ? "ml-auto w-20" : "w-24")} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function MetricsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 bg-card p-5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

/** Carregamento padrão de página: cabeçalho + tabela. Usado em app/loading.tsx. */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8" role="status" aria-label="Carregando">
      <PageHeaderSkeleton />
      <TableSkeleton />
    </div>
  )
}
