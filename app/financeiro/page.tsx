import { redirect } from "next/navigation"
import {
  listarPedidosComNota,
  listarPedidosPendentes,
  listarPedidosSemNota,
  listarSolicitacoesProrrogacao,
} from "@/app/actions/pedidos"
import { getUsuarioLogado } from "@/lib/auth-utils"
import { PageHeader } from "@/components/ui/page-header"
import { FinanceiroFluxo } from "@/components/financeiro-fluxo"

type Etapa = "aprovacao" | "aguardando" | "conferir" | "prorrogacoes"

// Links antigos (?tab=pagar, sem-nota) continuam funcionando.
const ALIAS: Record<string, Etapa> = {
  aprovacao: "aprovacao",
  aguardando: "aguardando",
  "sem-nota": "aguardando",
  conferir: "conferir",
  pagar: "conferir",
  prorrogacoes: "prorrogacoes",
}

export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const usuario = await getUsuarioLogado()
  if (!usuario) redirect("/login")
  if (!["Financeiro", "Adm"].includes(usuario.tipo_acesso)) redirect("/")

  const params = await searchParams

  const [pendentes, semNota, comNota, prorrogacoes] = await Promise.allSettled([
    listarPedidosPendentes(),
    listarPedidosSemNota(),
    listarPedidosComNota(),
    listarSolicitacoesProrrogacao(),
  ])
  const valor = <T,>(r: PromiseSettledResult<T>, padrao: T) => (r.status === "fulfilled" ? r.value : padrao)

  // Na aprovação do financeiro entram só os pedidos já aprovados pelo gerente
  // (para o Adm, a lista geral também traz os que aguardam gerente).
  const aprovacao = (valor(pendentes, []) || []).filter((p: any) => p.status === "pendente_financeiro")
  const listaComNota = valor(comNota, [] as any[])
  const listaSemNota = valor(semNota, [] as any[])
  const listaProrrogacoes = valor(prorrogacoes, [] as any[])

  // Sem aba pedida: abre onde há trabalho, na ordem do fluxo.
  const etapaInicial: Etapa =
    ALIAS[params.tab ?? ""] ??
    (aprovacao.length > 0
      ? "aprovacao"
      : listaComNota.some((p: any) => p.status !== "pago")
        ? "conferir"
        : listaSemNota.length > 0
          ? "aguardando"
          : "aprovacao")

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Financeiro"
        title="Aprovação e notas fiscais"
        description="Um fluxo só: aprovar o pedido, acompanhar a nota fiscal do prestador, conferir e marcar o pagamento."
      />
      <FinanceiroFluxo
        aprovacao={aprovacao}
        semNota={listaSemNota}
        comNota={listaComNota}
        prorrogacoes={listaProrrogacoes}
        etapaInicial={etapaInicial}
      />
    </div>
  )
}
