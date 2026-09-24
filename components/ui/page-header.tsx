import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: ReactNode
  /** Rótulo técnico acima do título (JetBrains Mono, caixa alta). Ex.: "Operação". */
  eyebrow?: string
  /** Ações da página. Uma só primária — o resto secondary/ghost. */
  action?: ReactNode
  /** Linha de contexto verificável abaixo da descrição (período, carteira, total). */
  meta?: ReactNode
  className?: string
}

// DESIGN_SYSTEM.md §12 e §4. Todo topo de página passa por aqui.
export function PageHeader({ title, description, eyebrow, action, meta, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="type-eyebrow mb-2 text-primary">{eyebrow}</p>}
        <h1 className="type-title text-foreground">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-text-secondary">{description}</p>}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">{meta}</div>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </header>
  )
}
