import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AtualizacoesAdminList } from "@/components/atualizacoes-admin-list"
import { PageHeader } from "@/components/ui/page-header"

export default async function GerenciarAtualizacoesPage() {
  const session = await getSession()

  if (!session?.isSuperAdmin) {
    redirect("/atualizacoes")
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Plataforma"
        title="Avisos"
        description="Crie, agende e envie os avisos institucionais do Fluxteme."
      />
      <AtualizacoesAdminList />
    </div>
  )
}
