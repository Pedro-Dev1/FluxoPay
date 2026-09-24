import type { ReactNode } from "react"
import { OctagonAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  /** O que não pôde ser feito. Ex.: "Não foi possível carregar os pedidos". */
  title?: string
  /** O que houve e como resolver. Sem pedir desculpa, sem stack trace. */
  description?: ReactNode
  /** Ação de recuperação — normalmente "Carregar de novo". */
  action?: ReactNode
  /** Código de referência (digest do erro) para o suporte localizar no log. */
  referencia?: string
  className?: string
  compact?: boolean
}

// DESIGN_SYSTEM.md §29.
export function ErrorState({
  title = "Não foi possível carregar esta página",
  description = "A consulta aos dados falhou. Carregue de novo; se persistir, informe o código abaixo ao suporte.",
  action,
  referencia,
  className,
  compact,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger-subtle text-center",
        compact ? "px-4 py-6" : "px-6 py-14",
        className,
      )}
    >
      <OctagonAlert className="mb-3 h-6 w-6 text-danger" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-text-secondary">{description}</p>}
      {referencia && (
        <p className="mt-3 type-audit text-text-tertiary">
          Referência <span className="text-foreground">{referencia}</span>
        </p>
      )}
      {action && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  )
}
