import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { ColaboradoresFinanceiroList } from "@/components/colaboradores-financeiro-list"
import { PageHeader } from "@/components/ui/page-header"

export default async function FinanceiroColaboradoresPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.tipoAcesso !== "Financeiro" && session.tipoAcesso !== "Adm") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <PageHeader eyebrow="Financeiro" title="Reajustes por colaborador" description="Salário atual de cada prestador e aplicação de reajuste." />
        <ColaboradoresFinanceiroList />
      </main>
    </div>
  )
}
