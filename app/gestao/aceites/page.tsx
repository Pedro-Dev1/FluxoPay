import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { AceitesTermosList } from "@/components/aceites-termos-list"

export default async function AceitesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (!["Adm", "Financeiro"].includes(session.tipoAcesso)) {
    redirect("/")
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <AceitesTermosList />
    </div>
  )
}
