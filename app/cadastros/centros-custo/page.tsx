import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { listarCentrosCusto } from "@/app/actions/centros-custo"
import { CentrosCustoList } from "@/components/centros-custo-list"

export default async function CentrosCustoPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.tipoAcesso !== "Adm" && session.tipoAcesso !== "Financeiro") {
    redirect("/")
  }

  const centros = await listarCentrosCusto()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
      <CentrosCustoList centros={centros} />
    </div>
  )
}
