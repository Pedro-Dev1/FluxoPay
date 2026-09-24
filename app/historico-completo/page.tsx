import { listarTodosPedidos } from "@/app/actions/pedidos"
import { listarEquipes } from "@/app/actions/equipes"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { HistoricoCompletoList } from "@/components/historico-completo-list"
import { PageHeader } from "@/components/ui/page-header"

export default async function HistoricoCompletoPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (!["Adm", "Gerente", "Financeiro"].includes(session.tipoAcesso)) {
    redirect("/")
  }

  const [pedidos, equipes] = await Promise.all([listarTodosPedidos(), listarEquipes()])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Auditoria"
        title="Histórico de pedidos"
        description={
          session.tipoAcesso === "Gerente"
            ? "Todos os pedidos das suas equipes, com status, datas e responsáveis."
            : "Todos os pedidos de pagamento da carteira, com status, datas e responsáveis."
        }
      />

      <HistoricoCompletoList pedidos={pedidos} equipes={equipes} />
    </div>
  )
}
