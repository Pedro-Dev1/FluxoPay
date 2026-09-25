import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { listarPedidosComNotaPendente } from "@/app/actions/pedidos"
import { PageHeader } from "@/components/ui/page-header"
import { ErrorState } from "@/components/ui/error-state"
import { AcompanhamentoNotas } from "@/components/acompanhamento-notas"
import { ehErroDeControleDoNext } from "@/lib/next-render-errors"

// Sempre com os dados do momento: nada de cache nesta página.
export const dynamic = "force-dynamic"

export default async function AcompanhamentoPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!["Supervisor", "Gerente", "Financeiro", "Adm"].includes(session.tipoAcesso)) redirect("/")

  const mes = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", month: "long", year: "numeric" }).format(new Date())

  let pedidos: any[] | null = null
  try {
    pedidos = await listarPedidosComNotaPendente()
  } catch (error) {
    if (ehErroDeControleDoNext(error)) throw error
    console.error("[v0] Erro ao carregar acompanhamento:", error)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Operação"
        title="Acompanhamento de notas"
        description={`Pedidos aprovados em ${mes} cujo prestador ainda não anexou a nota fiscal, do prazo mais urgente ao mais folgado.`}
      />
      {pedidos ? (
        <AcompanhamentoNotas pedidos={pedidos} mes={mes} />
      ) : (
        <ErrorState title="Não foi possível carregar o acompanhamento" />
      )}
    </div>
  )
}
