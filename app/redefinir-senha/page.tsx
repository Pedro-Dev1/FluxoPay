import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { RedefinirSenhaForm } from "@/components/redefinir-senha-form"
import { PageHeader } from "@/components/ui/page-header"

export default async function RedefinirSenhaPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Sistema"
        title="Redefinir senha"
        description="Troque a senha de acesso. Por segurança, a senha atual é pedida antes."
      />
      <RedefinirSenhaForm />
    </div>
  )
}
