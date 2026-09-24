import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  /** O que deveria aparecer aqui. Ex.: "Nenhum pedido aguardando aprovação". */
  title: string
  /** Por que está vazio e o que fazer. Nunca só "Nenhum dado". */
  description?: ReactNode
  /** A próxima ação, à mão. */
  action?: ReactNode
  icon?: LucideIcon
  className?: string
  /** Versão compacta, para dentro de tabelas e seções. */
  compact?: boolean
}

// DESIGN_SYSTEM.md §27.
export function EmptyState({ title, description, action, icon: Icon, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-8" : "px-6 py-16",
        className,
      )}
    >
      {Icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface">
          <Icon className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  )
}
