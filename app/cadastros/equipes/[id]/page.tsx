import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { buscarEquipe, listarColaboradoresPorEquipe, listarColaboradoresSemEquipe, listarSupervisores, listarGerentes } from "@/app/actions/equipes"
import { EquipeDetailView } from "@/components/equipe-detail-view"

interface EquipeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EquipeDetailPage({ params }: EquipeDetailPageProps) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (!["Adm", "Financeiro"].includes(session.tipoAcesso)) {
    redirect("/")
  }

  const equipe = await buscarEquipe(id)

  if (!equipe) {
    redirect("/equipes")
  }

  const [membros, semEquipe, supervisores, gerentes] = await Promise.all([
    listarColaboradoresPorEquipe(id),
    listarColaboradoresSemEquipe(),
    listarSupervisores(),
    listarGerentes(),
  ])

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
      <EquipeDetailView
        equipe={equipe}
        membros={membros}
        colaboradoresSemEquipe={semEquipe}
        supervisores={supervisores}
        gerentes={gerentes}
      />
    </div>
  )
}
