import { redirect } from "next/navigation"
import Link from "next/link"
import { Settings } from "lucide-react"
import { getSession } from "@/lib/session"
import { listarAtualizacoesParaUsuario } from "@/app/actions/atualizacoes"
import { AtualizacaoCard } from "@/components/atualizacao-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import type { Atualizacao } from "@/types/atualizacao"
import { PageHeader } from "@/components/ui/page-header"

export default async function AtualizacoesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const atualizacoes = (await listarAtualizacoesParaUsuario()) as Atualizacao[]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Visão geral"
        title="Atualizações"
        description="Mudanças no Fluxteme que afetam o seu trabalho, com a data de cada uma."
        action={
          session.isSuperAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/atualizacoes/gerenciar">
                <Settings />
                Gerenciar avisos
              </Link>
            </Button>
          )
        }
      />

      {atualizacoes.length === 0 ? (
        <EmptyState
          title="Nenhuma atualização por enquanto"
          description="Quando houver novidades no Fluxteme, elas aparecem aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {atualizacoes.map((atualizacao) => (
            <AtualizacaoCard key={atualizacao.id} atualizacao={atualizacao} />
          ))}
        </div>
      )}
    </div>
  )
}
