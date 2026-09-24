import {
  Ban,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Clock,
  FileCheck2,
  Loader2,
  OctagonAlert,
  PauseCircle,
  PencilLine,
  TriangleAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { StatusPedido } from "@/types/pedido"

// DESIGN_SYSTEM.md §21. Estado nunca depende só de cor: ícone + texto + cor.
type Tom = "neutro" | "andamento" | "sucesso" | "atencao" | "erro"

const TOM: Record<Tom, string> = {
  neutro: "bg-neutral-state-subtle text-neutral-state",
  andamento: "bg-accent text-accent-foreground",
  sucesso: "bg-success-subtle text-success",
  atencao: "bg-warning-subtle text-warning",
  erro: "bg-danger-subtle text-danger",
}

type Config = { label: string; tom: Tom; icon: LucideIcon; girando?: boolean }

// Linguagem geral de status do sistema.
export const STATUS_SISTEMA = {
  ativo: { label: "Ativo", tom: "sucesso", icon: CircleDot },
  inativo: { label: "Inativo", tom: "neutro", icon: PauseCircle },
  pendente: { label: "Pendente", tom: "atencao", icon: Clock },
  processando: { label: "Processando", tom: "andamento", icon: Loader2, girando: true },
  concluido: { label: "Concluído", tom: "sucesso", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", tom: "neutro", icon: XCircle },
  bloqueado: { label: "Bloqueado", tom: "erro", icon: Ban },
  erro: { label: "Erro", tom: "erro", icon: OctagonAlert },
  atencao: { label: "Atenção", tom: "atencao", icon: TriangleAlert },
  rascunho: { label: "Rascunho", tom: "neutro", icon: CircleDashed },
} satisfies Record<string, Config>

// Ciclo do pedido de pagamento.
const STATUS_PEDIDO: Record<StatusPedido, Config> = {
  pendente_gerente: { label: "Aguardando gerente", tom: "andamento", icon: Clock },
  pendente_financeiro: { label: "Aguardando financeiro", tom: "andamento", icon: Clock },
  aprovado: { label: "Aprovado", tom: "sucesso", icon: CheckCircle2 },
  recusado: { label: "Recusado", tom: "erro", icon: XCircle },
  correcao: { label: "Correção solicitada", tom: "atencao", icon: PencilLine },
  pago: { label: "Pago", tom: "sucesso", icon: CheckCircle2 },
  nota_recebida: { label: "Nota recebida", tom: "andamento", icon: FileCheck2 },
  aguardando_prorrogacao: { label: "Prorrogação solicitada", tom: "atencao", icon: Clock },
  prorrogacao_negada: { label: "Prorrogação negada", tom: "erro", icon: XCircle },
  expirado: { label: "Expirado", tom: "erro", icon: OctagonAlert },
}

function Etiqueta({ config, className }: { config: Config; className?: string }) {
  const Icon = config.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-control px-1.5 py-0.5 text-xs font-medium leading-4 whitespace-nowrap",
        TOM[config.tom],
        className,
      )}
    >
      <Icon className={cn("h-3 w-3 shrink-0", config.girando && "animate-spin")} aria-hidden="true" />
      {config.label}
    </span>
  )
}

/** Status de pedido de pagamento. Status desconhecido cai em neutro com o texto recebido. */
export function StatusBadge({ status, className }: { status: StatusPedido | string; className?: string }) {
  const config = STATUS_PEDIDO[status as StatusPedido] ?? { label: status, tom: "neutro", icon: CircleDot }
  return <Etiqueta config={config} className={className} />
}

/** Status genérico do sistema (ativo, pendente, bloqueado…), com rótulo opcional sobrescrito. */
export function StatusIndicator({
  status,
  label,
  className,
}: {
  status: keyof typeof STATUS_SISTEMA
  label?: string
  className?: string
}) {
  const base: Config = STATUS_SISTEMA[status]
  return <Etiqueta config={label ? { ...base, label } : base} className={className} />
}
