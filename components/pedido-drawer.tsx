"use client"

import { Download, FileText } from "lucide-react"
import type { PedidoPagamento } from "@/types/pedido"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/ui/status-badge"
import { AuditFields, AuditId, AuditTimestamp, AuditTrail, type AuditEvento } from "@/components/ui/audit"
import { useMaskedCurrency } from "@/components/currency-display"
import { PedidoComposicao } from "@/components/pedido-composicao"
import { PedidoWorkflow } from "@/components/pedido-workflow"

interface PedidoDrawerProps {
  pedido: PedidoPagamento | null
  onOpenChange: (open: boolean) => void
}

function notaDe(pedido: PedidoPagamento) {
  return Array.isArray(pedido.notas_fiscais) ? pedido.notas_fiscais[0] : pedido.notas_fiscais || null
}

/** Eventos do pedido em ordem, com autor quando o sistema registra quem agiu. */
function trilhaDe(pedido: PedidoPagamento): AuditEvento[] {
  const eventos: AuditEvento[] = [
    {
      id: "lancado",
      quando: pedido.created_at,
      acao: "Pedido lançado",
      autor: pedido.criado_por ? `${pedido.criado_por.nome_completo} · ${pedido.criado_por.tipo_acesso}` : undefined,
      tom: "neutro",
    },
  ]

  if (pedido.data_aprovacao_gerente) {
    const recusou = pedido.aprovado_gerente === false && pedido.status === "recusado"
    eventos.push({
      id: "gerente",
      quando: pedido.data_aprovacao_gerente,
      acao: recusou ? "Recusado pelo gerente" : pedido.aprovado_gerente ? "Aprovado pelo gerente" : "Correção pedida pelo gerente",
      autor: pedido.aprovado_por_gerente?.nome_completo,
      detalhe: pedido.observacao_gerente ? `“${pedido.observacao_gerente}”` : undefined,
      tom: recusou ? "erro" : pedido.aprovado_gerente ? "sucesso" : "atencao",
    })
  }

  if (pedido.data_aprovacao_financeiro) {
    const recusou = pedido.aprovado_financeiro === false && pedido.status === "recusado"
    eventos.push({
      id: "financeiro",
      quando: pedido.data_aprovacao_financeiro,
      acao: recusou
        ? "Recusado pelo financeiro"
        : pedido.aprovado_financeiro
          ? "Aprovado pelo financeiro"
          : "Correção pedida pelo financeiro",
      autor: pedido.aprovado_por_financeiro?.nome_completo,
      detalhe: pedido.observacao_financeiro ? `“${pedido.observacao_financeiro}”` : undefined,
      tom: recusou ? "erro" : pedido.aprovado_financeiro ? "sucesso" : "atencao",
    })
  }

  if (pedido.data_solicitacao_prorrogacao) {
    eventos.push({
      id: "prorrogacao",
      quando: pedido.data_solicitacao_prorrogacao,
      acao: "Prorrogação de prazo solicitada",
      detalhe: pedido.motivo_prorrogacao ? `“${pedido.motivo_prorrogacao}”` : undefined,
      tom: "atencao",
    })
  }

  const nota = notaDe(pedido)
  const quandoNota = pedido.data_emissao_nota || nota?.created_at
  if (quandoNota) {
    eventos.push({ id: "nota", quando: quandoNota, acao: "Nota fiscal anexada", tom: "neutro" })
  }
  if (pedido.data_nota_recebida) {
    eventos.push({ id: "recebida", quando: pedido.data_nota_recebida, acao: "Nota conferida pelo financeiro", tom: "sucesso" })
  }

  const ordenados = eventos.sort((a, b) => new Date(a.quando ?? 0).getTime() - new Date(b.quando ?? 0).getTime())

  // Etapa em aberto ao final da trilha
  const pendente =
    pedido.status === "pendente_gerente"
      ? "Aguardando decisão do gerente"
      : pedido.status === "pendente_financeiro"
        ? "Aguardando decisão do financeiro"
        : pedido.status === "aprovado"
          ? "Aguardando nota fiscal do prestador"
          : null
  if (pendente) ordenados.push({ id: "pendente", quando: null, acao: pendente, tom: "atual" })

  return ordenados
}

// DESIGN_SYSTEM.md §25 e §36. Detalhe contextual de um pedido: dados,
// evidências e trilha, sem sair da tabela.
export function PedidoDrawer({ pedido, onOpenChange }: PedidoDrawerProps) {
  const { formatValue } = useMaskedCurrency()
  const nota = pedido ? notaDe(pedido) : null

  return (
    <Sheet open={!!pedido} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {pedido && (
          <>
            <SheetHeader className="space-y-3 border-b border-border p-6 pr-12">
              <p className="type-eyebrow text-primary">Pedido de pagamento</p>
              <SheetTitle>{pedido.colaborador?.nome_completo || "Colaborador não identificado"}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <StatusBadge status={pedido.status} />
                  <span className="type-metric text-2xl text-foreground">{formatValue(pedido.valor_total)}</span>
                </div>
              </SheetDescription>
              <AuditId valor={pedido.id} rotulo="identificador do pedido" curto className="text-text-tertiary" />
            </SheetHeader>

            <div className="space-y-8 p-6">
              <section className="space-y-4">
                <h3 className="type-intertitle text-foreground">Fluxo do pedido</h3>
                <div className="rounded-lg border border-border bg-surface px-3 pb-4 pt-7">
                  <PedidoWorkflow pedido={pedido} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="type-intertitle text-foreground">Dados</h3>
                <AuditFields
                  itens={[
                    { rotulo: "Lançado em", valor: <AuditTimestamp valor={pedido.created_at} /> },
                    {
                      rotulo: "Lançado por",
                      valor: pedido.criado_por ? `${pedido.criado_por.nome_completo} · ${pedido.criado_por.tipo_acesso}` : "—",
                    },
                    { rotulo: "Equipe", valor: pedido.colaborador?.equipe?.nome ?? "Sem equipe" },
                    {
                      rotulo: "Centro de custo",
                      valor: pedido.colaborador?.centro_custo
                        ? `${pedido.colaborador.centro_custo.numero} · ${pedido.colaborador.centro_custo.nome}`
                        : "—",
                    },
                    { rotulo: "Tipo", valor: pedido.tipo_pedido === "reembolso_km" ? "Reembolso de KM" : "Completo" },
                    {
                      rotulo: "Previsão de pagamento",
                      valor: pedido.data_previsao_pagamento
                        ? new Date(pedido.data_previsao_pagamento + "T12:00:00").toLocaleDateString("pt-BR")
                        : "—",
                    },
                  ]}
                />
              </section>

              <section className="space-y-3">
                <h3 className="type-intertitle text-foreground">Composição do valor</h3>
                <div className="rounded-lg border border-border bg-surface p-4">
                  <PedidoComposicao pedido={pedido} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="type-intertitle text-foreground">Evidência fiscal</h3>
                {nota ? (
                  <div className="space-y-4">
                    <AuditFields
                      itens={[
                        { rotulo: "NFS-e", valor: nota.numero_nfse ? <AuditId valor={nota.numero_nfse} rotulo="número da NFS-e" /> : "—" },
                        { rotulo: "Valor do serviço", valor: <span className="tabular-nums">{formatValue(nota.valor_servico ?? 0)}</span> },
                        {
                          rotulo: "CPF/CNPJ do prestador",
                          valor: nota.cpf_cnpj_prestador ? <AuditId valor={nota.cpf_cnpj_prestador} rotulo="documento do prestador" /> : "—",
                        },
                        { rotulo: "Anexada em", valor: <AuditTimestamp valor={nota.created_at} /> },
                      ]}
                    />
                    {nota.chave_acesso && (
                      <div className="border-t border-border-subtle pt-2">
                        <p className="type-eyebrow text-text-tertiary">Chave de acesso</p>
                        <AuditId valor={nota.chave_acesso} rotulo="chave de acesso" className="mt-1" />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {nota.arquivo_xml_url && (
                        <a
                          href={nota.arquivo_xml_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-control border border-border-strong bg-card px-3 text-[13px] font-medium text-foreground hover:bg-surface"
                        >
                          <Download className="h-4 w-4" />
                          Baixar XML
                        </a>
                      )}
                      {nota.arquivo_pdf_url && (
                        <a
                          href={nota.arquivo_pdf_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-control border border-border-strong bg-card px-3 text-[13px] font-medium text-foreground hover:bg-surface"
                        >
                          <Download className="h-4 w-4" />
                          Baixar PDF
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-text-secondary">
                    <FileText className="h-4 w-4 text-text-tertiary" />
                    Nenhuma nota fiscal anexada a este pedido ainda.
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="type-intertitle text-foreground">Trilha de auditoria</h3>
                <AuditTrail eventos={trilhaDe(pedido)} />
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
