"use client"

import { Check, Clock, Minus, PencilLine, X } from "lucide-react"
import type { PedidoPagamento } from "@/types/pedido"
import { cn } from "@/lib/utils"

// Fluxo do pedido em etapas — o que aconteceu, onde está e quanto tempo cada
// passo levou (DESIGN_SYSTEM.md §36). Só usa datas que o sistema registra.

type Estado = "feito" | "atual" | "pendente" | "erro" | "atencao" | "pulado"

export type EtapaFluxo = {
  id: string
  rotulo: string
  quando: string | null
  estado: Estado
  detalhe?: string
}

const DATA = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" })
const HORA = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })

function notaDe(p: PedidoPagamento) {
  return Array.isArray(p.notas_fiscais) ? p.notas_fiscais[0] : p.notas_fiscais || null
}

export function etapasDoPedido(p: PedidoPagamento): EtapaFluxo[] {
  const km = p.tipo_pedido === "reembolso_km"
  const s = p.status
  const nota = notaDe(p)
  const recusadoNoGerente = s === "recusado" && p.aprovado_gerente === false
  const recusadoNoFinanceiro = s === "recusado" && !recusadoNoGerente
  const correcaoGerente = s === "correcao" && p.correcao_solicitada_por !== "financeiro"
  const correcaoFinanceiro = s === "correcao" && p.correcao_solicitada_por === "financeiro"
  const passouGerente = !!p.data_aprovacao_gerente || ["pendente_financeiro", "aprovado", "nota_recebida", "pago"].includes(s) || recusadoNoFinanceiro || correcaoFinanceiro
  const gerentePulado = passouGerente && !p.data_aprovacao_gerente && !recusadoNoGerente
  const financeiroOk = ["aprovado", "nota_recebida", "pago", "aguardando_prorrogacao", "prorrogacao_negada", "expirado"].includes(s)
  const notaOk = !!(p.data_emissao_nota || nota || p.nota_emitida) || ["nota_recebida", "pago"].includes(s)
  const conferida = ["nota_recebida", "pago"].includes(s)
  const encerrado = s === "recusado"

  const etapas: EtapaFluxo[] = [{ id: "lancado", rotulo: "Lançado", quando: p.created_at, estado: "feito", detalhe: p.criado_por?.nome_completo }]

  etapas.push({
    id: "gerente",
    rotulo: "Gerente",
    quando: p.data_aprovacao_gerente ?? null,
    detalhe: p.aprovado_por_gerente?.nome_completo ?? (gerentePulado ? "Não se aplica" : undefined),
    estado: recusadoNoGerente
      ? "erro"
      : correcaoGerente
        ? "atencao"
        : gerentePulado
          ? "pulado"
          : passouGerente
            ? "feito"
            : s === "pendente_gerente"
              ? "atual"
              : "pendente",
  })

  etapas.push({
    id: "financeiro",
    rotulo: "Financeiro",
    quando: p.data_aprovacao_financeiro ?? null,
    detalhe: p.aprovado_por_financeiro?.nome_completo,
    estado: recusadoNoFinanceiro
      ? "erro"
      : correcaoFinanceiro
        ? "atencao"
        : financeiroOk
          ? "feito"
          : s === "pendente_financeiro"
            ? "atual"
            : encerrado
              ? "pulado"
              : "pendente",
  })

  if (!km) {
    etapas.push({
      id: "nota",
      rotulo: "Nota fiscal",
      quando: p.data_emissao_nota ?? nota?.created_at ?? null,
      detalhe: nota?.numero_nfse ? `NFS-e ${nota.numero_nfse}` : undefined,
      estado: notaOk
        ? "feito"
        : s === "expirado" || s === "prorrogacao_negada"
          ? "erro"
          : s === "aguardando_prorrogacao"
            ? "atencao"
            : s === "aprovado"
              ? "atual"
              : encerrado
                ? "pulado"
                : "pendente",
    })
    etapas.push({
      id: "conferida",
      rotulo: "Conferida",
      quando: p.data_nota_recebida ?? null,
      estado: conferida ? "feito" : notaOk && s === "aprovado" ? "atual" : encerrado ? "pulado" : "pendente",
    })
  }

  etapas.push({
    id: "pago",
    rotulo: "Pago",
    quando: null,
    estado: s === "pago" ? "feito" : (km && s === "aprovado") || s === "nota_recebida" ? "atual" : encerrado ? "pulado" : "pendente",
  })

  return etapas
}

function duracao(de: string | null, ate: string | null) {
  if (!de || !ate) return null
  const horas = (new Date(ate).getTime() - new Date(de).getTime()) / 3600000
  if (horas < 0) return null
  if (horas < 1) return "< 1 h"
  if (horas < 24) return `${Math.round(horas)} h`
  return `${(horas / 24).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} d`
}

const MARCADOR: Record<Estado, string> = {
  feito: "border-primary bg-primary text-primary-foreground",
  atual: "border-primary bg-card text-primary ring-4 ring-primary/15",
  pendente: "border-border-strong bg-card text-text-tertiary",
  erro: "border-danger bg-danger text-danger-foreground",
  atencao: "border-warning bg-warning text-warning-foreground",
  pulado: "border-dashed border-border-strong bg-card text-text-tertiary",
}

function IconeEstado({ estado }: { estado: Estado }) {
  const c = "h-3.5 w-3.5"
  if (estado === "feito") return <Check className={c} />
  if (estado === "atual") return <Clock className={c} />
  if (estado === "erro") return <X className={c} />
  if (estado === "atencao") return <PencilLine className={c} />
  if (estado === "pulado") return <Minus className={c} />
  return <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
}

const LEGENDA: Partial<Record<Estado, string>> = {
  atual: "Aguardando",
  erro: "Recusado",
  atencao: "Correção",
  pulado: "Não se aplica",
}

/** Fluxo completo, para o detalhe do pedido. */
export function PedidoWorkflow({ pedido }: { pedido: PedidoPagamento }) {
  const etapas = etapasDoPedido(pedido)
  // Tempo até a última decisão registrada (inclusive recusa ou correção).
  const ultima = [...etapas].reverse().find((e) => e.id !== "lancado" && e.quando && ["feito", "erro", "atencao"].includes(e.estado))
  const total = ultima ? duracao(pedido.created_at, ultima.quando) : null

  return (
    <div>
      <ol className="flex items-start">
        {etapas.map((e, i) => {
          const anterior = etapas[i - 1]
          const tempo = i > 0 ? duracao(anterior.quando, e.quando) : null
          const trilhoFeito = i > 0 && ["feito", "atual", "erro", "atencao"].includes(e.estado) && anterior.estado !== "pendente"
          return (
            <li key={e.id} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
              {i > 0 && (
                <div className="absolute right-1/2 top-3 -z-0 h-px w-full" aria-hidden="true">
                  <div className={cn("h-px w-full", trilhoFeito ? "bg-primary" : "bg-border-strong", e.estado === "pulado" && "bg-transparent border-t border-dashed border-border-strong")} />
                  {tempo && (
                    <span className="type-audit absolute left-1/2 -top-4 -translate-x-1/2 whitespace-nowrap text-[10px] text-text-tertiary">
                      {tempo}
                    </span>
                  )}
                </div>
              )}
              <span
                className={cn("relative z-10 flex h-6 w-6 items-center justify-center rounded-full border", MARCADOR[e.estado])}
                title={LEGENDA[e.estado]}
              >
                <IconeEstado estado={e.estado} />
              </span>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  e.estado === "pendente" || e.estado === "pulado" ? "text-text-tertiary" : "text-foreground",
                  e.estado === "erro" && "text-danger",
                  e.estado === "atencao" && "text-warning",
                )}
              >
                {e.rotulo}
              </span>
              {e.quando ? (
                <span className="type-audit mt-0.5 text-[10px] leading-tight text-text-secondary">
                  {DATA.format(new Date(e.quando))}
                  <br />
                  {HORA.format(new Date(e.quando))}
                </span>
              ) : (
                LEGENDA[e.estado] && <span className="mt-0.5 text-[10px] text-text-tertiary">{LEGENDA[e.estado]}</span>
              )}
              {e.detalhe && e.estado !== "pulado" && (
                <span className="mt-0.5 max-w-full truncate px-1 text-[10px] text-text-tertiary" title={e.detalhe}>
                  {e.detalhe}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {total && (
        <p className="mt-4 text-center text-xs text-text-tertiary">
          Do lançamento até {ultima?.rotulo.toLowerCase()}: <span className="type-audit text-text-secondary">{total}</span>
        </p>
      )}
    </div>
  )
}

const BARRA: Record<Estado, string> = {
  feito: "bg-primary",
  atual: "bg-primary/35",
  pendente: "bg-border",
  erro: "bg-danger",
  atencao: "bg-warning",
  pulado: "bg-border opacity-50",
}

/** Fluxo compacto, para a linha da tabela. */
export function PedidoWorkflowMini({ pedido }: { pedido: PedidoPagamento }) {
  const etapas = etapasDoPedido(pedido)
  const resumo = etapas.map((e) => `${e.rotulo}: ${LEGENDA[e.estado] ?? (e.estado === "feito" ? "feito" : "pendente")}`).join(" · ")
  return (
    <span className="inline-flex items-center gap-0.5" title={resumo} aria-label={resumo}>
      {etapas.map((e) => (
        <span key={e.id} className={cn("h-1.5 w-4 rounded-full", BARRA[e.estado], e.estado === "atual" && "animate-none")} />
      ))}
    </span>
  )
}
