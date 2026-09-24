import { ColaboradorForm } from "@/components/colaborador-form"
import { ColaboradoresList } from "@/components/colaboradores-list"
import { Suspense } from "react"
import { getUsuarioLogado } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { TableSkeleton } from "@/components/ui/loading-states"

export default async function ColaboradoresPage() {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  if (usuario.tipo_acesso !== "Adm" && usuario.tipo_acesso !== "Financeiro") {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
            <p className="text-muted-foreground">Apenas administradores e financeiro podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  // </CHANGE>

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
      <PageHeader eyebrow="Gestão" title="Colaboradores" description="Cadastro dos prestadores e usuários da carteira." />

      <div className="grid gap-6 md:grid-cols-2">
        <ColaboradorForm usuarioLogadoTipoAcesso={usuario.tipo_acesso} />
        <Suspense fallback={<TableSkeleton rows={6} columns={3} />}>
          <ColaboradoresList usuarioLogadoTipoAcesso={usuario.tipo_acesso} />
        </Suspense>
      </div>
    </div>
  )
}
