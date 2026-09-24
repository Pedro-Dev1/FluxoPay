import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

// DESIGN_SYSTEM.md §12. Agrupa por proximidade e régua fina — não por card
// dentro de card. Intertítulo em Jost 500.
export function Section({ title, description, action, children, className }: SectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-4 border-b border-border pb-2">
        <div className="min-w-0">
          <h2 className="type-intertitle text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-text-secondary">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      {children}
    </section>
  )
}
