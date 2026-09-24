import { notFound } from "next/navigation"
import { DashboardClient } from "@/components/dashboard-client"
import { PageHeader } from "@/components/ui/page-header"
import { pedidosDeExemplo, EQUIPES_EXEMPLO } from "../dados-exemplo"

// Prévia do dashboard com dados fictícios, só em desenvolvimento — para
// avaliar o layout com volume real sem precisar do banco.
export default function DashboardPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  const pedidos = pedidosDeExemplo()
  const pendentes = pedidos.filter((p) => p.status === "pendente_gerente")

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader eyebrow="Visão geral" title="Dashboard" description="Prévia com dados fictícios." />
      <DashboardClient
        pedidos={pedidos}
        equipes={EQUIPES_EXEMPLO}
        tipoAcesso="Gerente"
        acaoAgoraItens={[{ label: "aguardando sua aprovação", count: pendentes.length, href: "/aprovacoes" }]}
        acaoAgoraMaisAntigo={
          pendentes[0]
            ? { nome: pendentes[0].colaborador!.nome_completo, tipo: "Pedido completo", createdAt: pendentes[0].created_at }
            : null
        }
      />
    </div>
  )
}
