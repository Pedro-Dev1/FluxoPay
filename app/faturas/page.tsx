import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getFaturas } from "@/app/actions/faturas"
import { listarFaturasPlataformaDoTenant } from "@/app/actions/faturamento"
import { getColaboradores } from "@/app/actions/colaboradores"
import { FaturasList } from "@/components/faturas-list"
import { FaturaPlataformaCard } from "@/components/fatura-plataforma-card"
import { PageHeader } from "@/components/ui/page-header"

export default async function FaturasPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const tipoAcesso = session.tipoAcesso?.toLowerCase() || ""
  const isAdm = tipoAcesso === "adm"
  const isFinanceiro = tipoAcesso === "financeiro"
  const canViewFaturas = isAdm || isFinanceiro
  const canManageFaturas = isAdm // Apenas Adm pode criar/editar/deletar
  const shouldViewAllFaturas = isAdm || isFinanceiro // Adm e Financeiro veem todas as faturas
  const colaboradorId = session.colaboradorId?.toString() || ""
  
  // Se não é Adm nem Financeiro, redirecionar
  if (!canViewFaturas) {
    redirect("/")
  }
  
  const faturas = await getFaturas(colaboradorId, shouldViewAllFaturas)
  const colaboradores = canManageFaturas ? await getColaboradores() : []
  const faturasPlataforma = await listarFaturasPlataformaDoTenant()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Financeiro"
        title="Faturas"
        description={
          canManageFaturas
            ? "Faturas da carteira e quem pode visualizar cada uma."
            : "Faturas da carteira, com exportação."
        }
      />

      <FaturaPlataformaCard faturas={faturasPlataforma} />

      <FaturasList
        faturas={faturas}
        colaboradores={colaboradores}
        isAdmin={canManageFaturas}
        colaboradorId={colaboradorId}
        tipoAcesso={session.tipoAcesso || ""}
      />
    </div>
  )
}
