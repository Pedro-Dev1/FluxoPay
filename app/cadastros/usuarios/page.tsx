import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { listarUsuariosComSituacao, type UsuarioSituacao } from "@/app/actions/colaboradores"
import { PageHeader } from "@/components/ui/page-header"
import { ErrorState } from "@/components/ui/error-state"
import { UsuariosSituacaoList } from "@/components/usuarios-situacao-list"
import { ehErroDeControleDoNext } from "@/lib/next-render-errors"

export default async function UsuariosPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!["Adm", "Financeiro"].includes(session.tipoAcesso) && !session.isSuperAdmin) redirect("/")

  let usuarios: UsuarioSituacao[] | null = null
  let erro: string | null = null
  try {
    usuarios = await listarUsuariosComSituacao()
  } catch (error) {
    if (ehErroDeControleDoNext(error)) throw error
    erro = error instanceof Error ? error.message : null
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Gestão"
        title="Usuários ativos e inativos"
        description="Quem pode entrar no sistema e aparecer para novos lançamentos. Desativar não apaga pedidos, notas nem a trilha."
      />
      {usuarios ? (
        <UsuariosSituacaoList usuarios={usuarios} usuarioLogadoId={session.colaboradorId} />
      ) : (
        <ErrorState title="Não foi possível carregar os usuários" description={erro ?? undefined} />
      )}
    </div>
  )
}
