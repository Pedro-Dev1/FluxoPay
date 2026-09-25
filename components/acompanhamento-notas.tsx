"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, FileCheck2 } from "lucide-react"
import type { PedidoPagamento } from "@/types/pedido"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { AuditTimestamp } from "@/components/ui/audit"
import { PedidoDrawer } from "@/components/pedido-drawer"
import { useMaskedCurrency } from "@/components/currency-display"
import { cn } from "@/lib/utils"

const HORA_MS = 3600000
const HORA = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })

type Prazo = { rotulo: string; tom: "erro" | "atencao" | "neutro"; horas: number }

function prazoDe(p: PedidoPagamento, agora: number): Prazo {
  if (!p.data_limite_anexo_nota) return { rotulo: "Sem prazo definido", tom: "neutro", horas: Infinity }
  const horas = (new Date(p.data_limite_anexo_nota).getTime() - agora) / HORA_MS
  if (horas < 0) {
    const dias = Math.max(1, Math.floor(-horas / 24))
    return { rotulo: `Venceu há ${dias} ${dias === 1 ? "dia" : "dias"}`, tom: "erro", horas }
  }
  if (horas < 24) return { rotulo: horas < 1 ? "Vence em menos de 1 hora" : `Vence em ${Math.floor(horas)} h`, tom: "atencao", horas }
  const dias = Math.floor(horas / 24)
  return { rotulo: `Vence em ${dias} ${dias === 1 ? "dia" : "dias"}`, tom: "neutro", horas }
}

const TOM: Record<Prazo["tom"], string> = {
  erro: "bg-danger-subtle text-danger",
  atencao: "bg-warning-subtle text-warning",
  neutro: "bg-neutral-state-subtle text-neutral-state",
}

// Notas fiscais em aberto do mês corrente, pela urgência do prazo. Atualiza
// sozinha a cada minuto e ao voltar para a aba.
export function AcompanhamentoNotas({ pedidos, mes }: { pedidos: PedidoPagamento[]; mes: string }) {
  const router = useRouter()
  const { formatValue } = useMaskedCurrency()
  const [agora, setAgora] = useState(() => Date.now())
  const [selecionado, setSelecionado] = useState<PedidoPagamento | null>(null)

  useEffect(() => {
    const atualizar = () => {
      router.refresh()
      setAgora(Date.now())
    }
    const intervalo = setInterval(atualizar, 60000)
    const aoVoltar = () => document.visibilityState === "visible" && atualizar()
    document.addEventListener("visibilitychange", aoVoltar)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener("visibilitychange", aoVoltar)
    }
  }, [router])

  const linhas = useMemo(
    () =>
      pedidos
        .map((p) => ({ pedido: p, prazo: prazoDe(p, agora) }))
        .sort((a, b) => a.prazo.horas - b.prazo.horas),
    [pedidos, agora],
  )

  const vencidos = linhas.filter((l) => l.prazo.tom === "erro").length
  const em24h = linhas.filter((l) => l.prazo.tom === "atencao").length
  const valor = pedidos.reduce((s, p) => s + p.valor_total, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-[2fr_1fr_1fr]">
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Aguardando nota fiscal · {mes}</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="type-metric text-foreground">{pedidos.length}</span>
            <span className="text-sm tabular-nums text-text-secondary">{pedidos.length === 1 ? "pedido" : "pedidos"} · {formatValue(valor)}</span>
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            Atualizado às <span className="tabular-nums">{HORA.format(agora)}</span> · atualiza sozinho a cada minuto
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Prazo vencido</p>
          <p className={cn("mt-2 font-display text-3xl font-light tabular-nums", vencidos > 0 ? "text-danger" : "text-foreground")}>
            {vencidos}
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Vencem em 24 horas</p>
          <p className={cn("mt-2 font-display text-3xl font-light tabular-nums", em24h > 0 ? "text-warning" : "text-foreground")}>{em24h}</p>
        </div>
      </div>

      {linhas.length === 0 ? (
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            icon={FileCheck2}
            title={`Nenhuma nota fiscal em aberto em ${mes}`}
            description="Todo pedido aprovado neste mês já está com a nota anexada. Novos pedidos aprovados aparecem aqui até o prestador anexar a nota."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prestador</TableHead>
                <TableHead className="hidden md:table-cell">Equipe</TableHead>
                <TableHead className="hidden sm:table-cell">Aprovado em</TableHead>
                <TableHead>Prazo da nota</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-8">
                  <span className="sr-only">Abrir</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map(({ pedido, prazo }) => (
                <TableRow
                  key={pedido.id}
                  tabIndex={0}
                  className="group cursor-pointer"
                  onClick={() => setSelecionado(pedido)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelecionado(pedido)
                    }
                  }}
                >
                  <TableCell className="max-w-[16rem] truncate text-sm font-medium text-foreground">
                    {pedido.colaborador?.nome_completo ?? "Não identificado"}
                  </TableCell>
                  <TableCell className="hidden max-w-[12rem] truncate text-sm text-text-secondary md:table-cell">
                    {pedido.colaborador?.equipe?.nome ?? "Sem equipe"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <AuditTimestamp valor={pedido.data_aprovacao_financeiro} className="text-text-secondary" />
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex rounded-control px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", TOM[prazo.tom])}>
                      {prazo.rotulo}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-sm font-medium tabular-nums">
                    {formatValue(pedido.valor_total)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-text-tertiary transition-colors group-hover:text-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PedidoDrawer pedido={selecionado} onOpenChange={(aberto) => !aberto && setSelecionado(null)} />
    </div>
  )
}
