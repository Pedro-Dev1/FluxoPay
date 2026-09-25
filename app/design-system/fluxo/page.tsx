import { notFound } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { FinanceiroFluxo } from "@/components/financeiro-fluxo"
import { AcompanhamentoNotas } from "@/components/acompanhamento-notas"
import { HistoricoCompletoList } from "@/components/historico-completo-list"
import { EQUIPES_EXEMPLO, pedidosDeExemplo } from "../dados-exemplo"

// Prévia (dados fictícios) do fluxo do financeiro, do acompanhamento e do
// histórico com o fluxo visual. Só em desenvolvimento.
export default function FluxoPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  const pedidos = pedidosDeExemplo()
  const agora = Date.now()
  const aprovados = pedidos
    .filter((p) => p.status === "aprovado" && p.tipo_pedido !== "reembolso_km")
    .map((p, i) => ({ ...p, data_limite_anexo_nota: new Date(agora + (i - 1) * 20 * 3600000).toISOString() }))

  return (
    <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-8 lg:px-8">
      <div>
        <PageHeader eyebrow="Financeiro" title="Aprovação e notas fiscais" description="Prévia com dados fictícios." />
        <FinanceiroFluxo
          aprovacao={pedidos.filter((p) => p.status === "pendente_financeiro")}
          semNota={aprovados}
          comNota={pedidos.filter((p) => ["nota_recebida", "pago"].includes(p.status)).slice(0, 8)}
          prorrogacoes={[]}
          etapaInicial="aguardando"
        />
      </div>
      <div>
        <PageHeader eyebrow="Operação" title="Acompanhamento de notas" description="Prévia com dados fictícios." />
        <AcompanhamentoNotas pedidos={aprovados} mes="setembro de 2026" />
      </div>
      <div>
        <PageHeader eyebrow="Auditoria" title="Histórico de pedidos" description="Prévia com dados fictícios." />
        <HistoricoCompletoList pedidos={pedidos} equipes={EQUIPES_EXEMPLO as any} />
      </div>
    </div>
  )
}
