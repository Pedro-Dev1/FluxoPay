import { createAdminClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { MeusPagamentosList } from "@/components/meus-pagamentos-list"
import { getSession } from "@/lib/session"
import { listarHistoricoReajustes } from "@/app/actions/reajustes"
import { HistoricoReajustesList } from "@/components/historico-reajustes-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"

export default async function MeusPagamentosPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const supabase = await createAdminClient()

  const { data: colaborador } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("id", session.colaboradorId)
    .single()

  // Pedidos em andamento (todos os status exceto pago e nota_recebida)
  const queryEmAndamento = supabase
    .from("pedidos_pagamento")
    .select("*")
    .eq("colaborador_id", session.colaboradorId)
    .in("status", ["pendente_gerente", "pendente_financeiro", "aprovado", "correcao", "aguardando_prorrogacao", "prorrogacao_negada"])
    .order("created_at", { ascending: false })

  // Pedidos concluídos (pago ou nota_recebida)
  const queryConcluidos = supabase
    .from("pedidos_pagamento")
    .select("*")
    .eq("colaborador_id", session.colaboradorId)
    .in("status", ["pago", "nota_recebida"])
    .order("created_at", { ascending: false })

  const { data: pedidosEmAndamento } = await queryEmAndamento
  const { data: pedidosConcluidos } = await queryConcluidos

  let reajustes: any[] = []
  try {
    reajustes = await listarHistoricoReajustes(session.colaboradorId)
  } catch (error) {
    console.error("[v0] Erro ao carregar reajustes, continuando sem eles:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <PageHeader eyebrow="Operação" title="Meus pagamentos" description="Cada pedido de pagamento em seu nome, com a etapa em que está e o que falta." />

        <Tabs defaultValue="andamento" className="w-full">
          <TabsList>
            <TabsTrigger value="andamento">
              Em andamento <span className="type-audit text-text-tertiary">{pedidosEmAndamento?.length || 0}</span>
            </TabsTrigger>
            <TabsTrigger value="concluidos">
              Concluídos <span className="type-audit text-text-tertiary">{pedidosConcluidos?.length || 0}</span>
            </TabsTrigger>
            <TabsTrigger value="reajustes">
              Reajustes <span className="type-audit text-text-tertiary">{reajustes.length}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="andamento" className="mt-6">
            <MeusPagamentosList pedidos={pedidosEmAndamento || []} colaborador={colaborador} />
          </TabsContent>
          <TabsContent value="concluidos" className="mt-6">
            <MeusPagamentosList pedidos={pedidosConcluidos || []} colaborador={colaborador} isHistorico />
          </TabsContent>
          <TabsContent value="reajustes" className="mt-6">
            <HistoricoReajustesList reajustes={reajustes} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
