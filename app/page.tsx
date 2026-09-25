import {
  listarPedidosComFiltros,
  listarPedidosPorSupervisor,
  listarPedidosPorGerente,
  listarPedidosComNota,
  listarPedidosSemNota,
  listarSolicitacoesProrrogacao,
  listarPedidosParaCorrecao,
} from "./actions/pedidos"
import { listarEquipes, listarEquipesPorGerente } from "./actions/equipes"
import { obterBannerDestaque } from "./actions/atualizacoes"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardClient } from "@/components/dashboard-client"
import type { AcaoAgoraItem } from "@/components/dashboard-resumo"
import { SystemControl } from "@/components/system-control"
import { AtualizacaoBanner } from "@/components/atualizacao-banner"
import { PageHeader } from "@/components/ui/page-header"

export default async function Home() {
  const session = await getSession()

  if (session?.tipoAcesso === "Colaborador") {
    redirect("/meus-pagamentos")
  }

  let pedidos: any[] = []
  let equipes: Array<{ id: string; nome: string }> = []

  try {
    if (session?.tipoAcesso === "Supervisor") {
      pedidos = await listarPedidosPorSupervisor(session.colaboradorId)
    } else if (session?.tipoAcesso === "Gerente") {
      pedidos = await listarPedidosPorGerente(session.colaboradorId, {})
    } else {
      pedidos = await listarPedidosComFiltros({})
    }
  } catch (error) {
    console.error("[v0] Erro ao listar pedidos:", error)
  }

  try {
    if (session?.tipoAcesso === "Gerente") {
      equipes = (await listarEquipesPorGerente(session.colaboradorId)).map((e) => ({ id: e.id, nome: e.nome }))
    } else {
      equipes = (await listarEquipes()).map((e) => ({ id: e.id, nome: e.nome }))
    }
  } catch (error) {
    console.error("[v0] Erro ao listar equipes:", error)
  }

  const isAdmin = session?.tipoAcesso === "Adm"

  // "Requer ação agora": o que precisa da decisão de quem está logado, hoje.
  // Muda de fonte conforme o papel — cada um age sobre uma fila diferente.
  let acaoAgoraItens: AcaoAgoraItem[] = []
  let acaoAgoraCandidatos: any[] = []

  try {
    if (session?.tipoAcesso === "Adm" || session?.tipoAcesso === "Financeiro") {
      const [comNota, semNota, prorrogacoes] = await Promise.all([
        listarPedidosComNota(),
        listarPedidosSemNota(),
        listarSolicitacoesProrrogacao(),
      ])
      acaoAgoraItens = [
        {
          label: "aguardando aprovação do financeiro",
          count: pedidos.filter((p: any) => p.status === "pendente_financeiro").length,
          href: "/financeiro?tab=aprovacao",
        },
        { label: "notas para conferir e pagar", count: comNota.filter((p: any) => p.status !== "pago").length, href: "/financeiro?tab=conferir" },
        { label: "aguardando nota fiscal", count: semNota.length, href: "/financeiro?tab=aguardando" },
        { label: "prorrogações para decidir", count: prorrogacoes.length, href: "/financeiro?tab=prorrogacoes" },
      ]
      acaoAgoraCandidatos = [...pedidos.filter((p: any) => p.status === "pendente_financeiro"), ...comNota, ...semNota]
    } else if (session?.tipoAcesso === "Gerente") {
      const pendentes = pedidos.filter((p) => p.status === "pendente_gerente")
      acaoAgoraItens = [{ label: "aguardando sua aprovação", count: pendentes.length, href: "/aprovacoes" }]
      acaoAgoraCandidatos = pendentes
    } else if (session?.tipoAcesso === "Supervisor") {
      const correcao = await listarPedidosParaCorrecao()
      acaoAgoraItens = [{ label: "em correção — precisam ser reenviados", count: correcao.length, href: "/pedidos" }]
      acaoAgoraCandidatos = correcao
    }
  } catch (error) {
    console.error("[v0] Erro ao montar resumo de ação agora:", error)
  }

  const maisAntigo = acaoAgoraCandidatos.reduce<any>((oldest, atual) => {
    if (!oldest) return atual
    return new Date(atual.created_at) < new Date(oldest.created_at) ? atual : oldest
  }, null)

  const banner = await obterBannerDestaque().catch(() => null)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="O que exige ação agora, o que mudou no período e onde cada pedido está."
      />

      <AtualizacaoBanner atualizacao={banner} />

      <DashboardClient
        pedidos={pedidos}
        equipes={equipes}
        tipoAcesso={session?.tipoAcesso || ""}
        acaoAgoraItens={acaoAgoraItens}
        acaoAgoraMaisAntigo={
          maisAntigo
            ? {
                nome: maisAntigo.colaborador?.nome_completo || maisAntigo.colaboradores?.nome_completo || "N/A",
                tipo: maisAntigo.tipo_pedido === "reembolso_km" ? "Reembolso KM" : "Pedido Completo",
                createdAt: maisAntigo.created_at,
              }
            : null
        }
      />

      {isAdmin && (
        <div className="mt-6">
          <SystemControl />
        </div>
      )}

      {session?.isSuperAdmin && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Painel Super Admin</p>
            <p className="text-sm text-muted-foreground">Carteiras, usuários e auditoria de todo o sistema.</p>
          </div>
          <Link href="/admin" className="text-sm font-medium text-primary hover:underline">
            Acessar →
          </Link>
        </div>
      )}
    </div>
  )
}
