import { listarPedidosPendentes } from "@/app/actions/pedidos"
import { getUsuarioLogado } from "@/lib/auth-utils"
import { AprovacoesList } from "@/components/aprovacoes-list"
import { PageHeader } from "@/components/ui/page-header"
import { redirect } from "next/navigation"

export default async function AprovacoesPage() {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  if (!["Gerente", "Financeiro", "Adm"].includes(usuario.tipo_acesso)) {
    redirect("/")
  }

  // O Financeiro aprova no fluxo único de /financeiro.
  if (usuario.tipo_acesso === "Financeiro") {
    redirect("/financeiro?tab=aprovacao")
  }

  let pedidos = []
  try {
    pedidos = await listarPedidosPendentes()
  } catch (error) {
    console.error("[v0] Erro ao carregar pedidos:", error)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Operação"
        title="Aprovações pendentes"
        description={
          usuario.tipo_acesso === "Gerente"
            ? "Pedidos da sua equipe aguardando decisão: aprovar, recusar ou pedir correção."
            : "Pedidos já aprovados pelo gerente aguardando a decisão do financeiro."
        }
      />

      <AprovacoesList pedidos={pedidos} tipoAcesso={usuario.tipo_acesso} />
    </div>
  )
}
