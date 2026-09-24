"use client"

import { useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

// DESIGN_SYSTEM.md §36 — elementos auditáveis. O que pode ser verificado
// (ID, protocolo, hash, horário, autor) aparece em JetBrains Mono, com o
// valor exato disponível: nada é arredondado ou escondido sem forma de ver
// o original.

// Fuso fixo de Brasília: o servidor (Vercel) roda em UTC e o SSR mostraria
// 3 h a mais — e divergiria do cliente na hidratação. O instante exato em
// UTC continua disponível no title.
const DATA_HORA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

function BotaoCopiar({ valor, rotulo }: { valor: string; rotulo: string }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(valor)
          setCopiado(true)
          setTimeout(() => setCopiado(false), 1500)
        } catch {
          // Sem permissão de área de transferência: o valor continua
          // selecionável no próprio texto.
        }
      }}
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-control text-text-tertiary transition-colors hover:bg-surface hover:text-foreground"
      aria-label={copiado ? `${rotulo} copiado` : `Copiar ${rotulo}`}
      title={copiado ? "Copiado" : `Copiar ${rotulo}`}
    >
      {copiado ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

/** Encurta pelo meio, preservando início e fim — o que se confere a olho. */
function encurtar(valor: string, inicio: number, fim: number) {
  return valor.length <= inicio + fim + 1 ? valor : `${valor.slice(0, inicio)}…${valor.slice(-fim)}`
}

/** ID, protocolo ou número de documento. `curto` mostra só o começo e o fim. */
export function AuditId({
  valor,
  rotulo = "identificador",
  curto = false,
  copiavel = true,
  className,
}: {
  valor: string
  rotulo?: string
  curto?: boolean
  copiavel?: boolean
  className?: string
}) {
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1 type-audit text-foreground", className)}>
      <span className="truncate" title={valor}>
        {curto ? encurtar(valor, 8, 4) : valor}
      </span>
      {copiavel && <BotaoCopiar valor={valor} rotulo={rotulo} />}
    </span>
  )
}

/** Hash de integridade (SHA-256 etc.). */
export function AuditHash({ valor, algoritmo = "SHA-256", className }: { valor: string; algoritmo?: string; className?: string }) {
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1.5 type-audit", className)}>
      <span className="text-text-tertiary">{algoritmo}</span>
      <span className="truncate text-foreground" title={valor}>
        {encurtar(valor, 12, 8)}
      </span>
      <BotaoCopiar valor={valor} rotulo={`hash ${algoritmo}`} />
    </span>
  )
}

/** Horário exato até o segundo. O instante em UTC fica no título. */
export function AuditTimestamp({ valor, className }: { valor: string | Date | null | undefined; className?: string }) {
  if (!valor) return <span className={cn("type-audit text-text-tertiary", className)}>—</span>
  const data = typeof valor === "string" ? new Date(valor) : valor
  if (Number.isNaN(data.getTime())) return <span className={cn("type-audit text-text-tertiary", className)}>—</span>
  return (
    <time dateTime={data.toISOString()} title={`${data.toISOString()} (UTC)`} className={cn("type-audit text-foreground whitespace-nowrap", className)}>
      {DATA_HORA.format(data).replace(",", "")}
    </time>
  )
}

/** Lista de evidências: rótulo técnico + valor. Colunas em telas largas. */
export function AuditFields({
  itens,
  colunas = 2,
  className,
}: {
  itens: { rotulo: string; valor: ReactNode }[]
  colunas?: 1 | 2 | 3
  className?: string
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-3",
        colunas === 2 && "sm:grid-cols-2",
        colunas === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {itens.map((item) => (
        <div key={item.rotulo} className="min-w-0 border-t border-border-subtle pt-2">
          <dt className="type-eyebrow text-text-tertiary">{item.rotulo}</dt>
          <dd className="mt-1 min-w-0 text-sm text-foreground">{item.valor ?? "—"}</dd>
        </div>
      ))}
    </dl>
  )
}

export type AuditEvento = {
  id: string
  quando: string | null | undefined
  acao: ReactNode
  autor?: ReactNode
  detalhe?: ReactNode
  tom?: "neutro" | "sucesso" | "atencao" | "erro" | "atual"
}

const MARCADOR: Record<NonNullable<AuditEvento["tom"]>, string> = {
  neutro: "border-border-strong bg-card",
  sucesso: "border-success bg-success",
  atencao: "border-warning bg-warning",
  erro: "border-danger bg-danger",
  atual: "border-primary bg-card ring-2 ring-primary/25",
}

/** Trilha de auditoria: quem fez o quê e quando, em ordem. */
export function AuditTrail({ eventos, className }: { eventos: AuditEvento[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-4 border-l border-border pl-5", className)}>
      {eventos.map((e) => (
        <li key={e.id} className="relative">
          <span
            className={cn("absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2", MARCADOR[e.tom ?? "neutro"])}
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="text-sm font-medium text-foreground">{e.acao}</p>
            <AuditTimestamp valor={e.quando} className="text-text-tertiary" />
          </div>
          {e.autor && <p className="mt-0.5 text-[13px] text-text-secondary">{e.autor}</p>}
          {e.detalhe && <div className="mt-1 text-[13px] text-text-secondary">{e.detalhe}</div>}
        </li>
      ))}
    </ol>
  )
}
