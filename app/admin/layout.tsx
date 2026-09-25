import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AdminNav } from "@/components/admin-nav"
import { PageHeader } from "@/components/ui/page-header"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session?.isSuperAdmin) {
    redirect("/")
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Plataforma"
        title="Painel Super Admin"
        description="Carteiras, usuários, termos e trilha de auditoria de todas as carteiras."
      />
      <AdminNav />
      <div className="mt-6">{children}</div>
    </div>
  )
}
