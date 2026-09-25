"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import type { PedidoPagamento } from "@/types/pedido"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AprovacoesList } from "@/components/aprovacoes-list"
import { PedidosSemNotaList } from "@/components/pedidos-sem-nota-list"
import { MarcarPagoList } from "@/components/marcar-pago-list"
import { SolicitacoesProrrogacaoList } from "@/components/solicitacoes-prorrogacao-list"
import { cn } from "@/lib/utils"

type Etapa = "aprovacao" | "aguardando" | "conferir" | "prorrogacoes"

// Um fluxo só para o financeiro: aprovar o pedido e, depois, controlar a nota
// fiscal até o pagamento. A aba de cima separa as duas partes; dentro de
// "Controle de NF" os passos aparecem na ordem em que acontecem.
export function FinanceiroFluxo({
  aprovacao,
  semNota,
  comNota,
  prorrogacoes,
  etapaInicial,
}: {
  aprovacao: PedidoPagamento[]
  semNota: any[]
  comNota: any[]
  prorrogacoes: any[]
  etapaInicial: Etapa
}) {
  const [etapa, setEtapa] = useState<Etapa>(etapaInicial)
  const parte = etapa === "aprovacao" ? "aprovacao" : "notas"

  const paraConferir = comNota.filter((p) => p.status !== "pago").length
  const totalNotas = semNota.length + paraConferir + prorrogacoes.length

  const irPara = (nova: Etapa) => {
    setEtapa(nova)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set("tab", nova)
      window.history.replaceState(null, "", url)
    } catch {}
  }

  const passos: { id: Etapa; rotulo: string; qtd: number; ajuda: string }[] = [
    { id: "aguardando", rotulo: "Aguardando nota", qtd: semNota.length, ajuda: "Aprovados; o prestador ainda não anexou a NF" },
    { id: "conferir", rotulo: "Conferir e pagar", qtd: paraConferir, ajuda: "NF anexada: conferir e marcar o pagamento" },
  ]

  return (
    <Tabs value={parte} onValueChange={(v) => irPara(v === "aprovacao" ? "aprovacao" : etapa === "aprovacao" ? "aguardando" : etapa)}>
      <TabsList>
        <TabsTrigger value="aprovacao">
          Aprovação <Contador n={aprovacao.length} />
        </TabsTrigger>
        <TabsTrigger value="notas">
          Controle de NF <Contador n={totalNotas} />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="aprovacao" className="mt-6">
        <AprovacoesList pedidos={aprovacao} tipoAcesso="Financeiro" />
      </TabsContent>

      <TabsContent value="notas" className="mt-6 space-y-6">
        <nav aria-label="Etapas do controle de NF" className="flex flex-wrap items-stretch gap-2">
          {passos.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />}
              <Passo ativo={etapa === p.id} onClick={() => irPara(p.id)} numero={i + 1} {...p} />
            </div>
          ))}
          <div className="ml-auto flex items-center">
            <Passo
              ativo={etapa === "prorrogacoes"}
              onClick={() => irPara("prorrogacoes")}
              id="prorrogacoes"
              rotulo="Prorrogações"
              qtd={prorrogacoes.length}
              ajuda="Pedidos de mais prazo para a NF"
              alerta={prorrogacoes.length > 0}
            />
          </div>
        </nav>

        {etapa === "aguardando" && <PedidosSemNotaList pedidos={semNota} />}
        {etapa === "conferir" && <MarcarPagoList pedidos={comNota} />}
        {etapa === "prorrogacoes" && <SolicitacoesProrrogacaoList solicitacoes={prorrogacoes} />}
      </TabsContent>
    </Tabs>
  )
}

function Contador({ n }: { n: number }) {
  if (n === 0) return null
  return <span className="type-audit rounded-full bg-accent px-1.5 text-accent-foreground">{n}</span>
}

function Passo({
  numero,
  rotulo,
  qtd,
  ajuda,
  ativo,
  alerta,
  onClick,
}: {
  id: Etapa
  numero?: number
  rotulo: string
  qtd: number
  ajuda: string
  ativo: boolean
  alerta?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "flex min-w-[13rem] items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-150",
        ativo ? "border-primary bg-accent" : "border-border bg-card hover:border-border-strong hover:bg-surface",
      )}
    >
      {numero && (
        <span
          className={cn(
            "type-audit mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            ativo ? "border-primary text-primary" : "border-border-strong text-text-tertiary",
          )}
        >
          {numero}
        </span>
      )}
      <span className="min-w-0">
        <span className="flex items-baseline gap-2">
          <span className={cn("text-sm font-medium", ativo ? "text-foreground" : "text-text-secondary")}>{rotulo}</span>
          <span className={cn("font-display text-lg font-light tabular-nums", alerta ? "text-warning" : "text-foreground")}>{qtd}</span>
        </span>
        <span className="block text-xs text-text-tertiary">{ajuda}</span>
      </span>
    </button>
  )
}
