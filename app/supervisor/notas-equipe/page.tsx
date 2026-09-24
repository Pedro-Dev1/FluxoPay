import { listarPedidosPorSupervisor } from "@/app/actions/pedidos"
import { getUsuarioLogado } from "@/lib/auth-utils"
import { NotasEnviadasList } from "@/components/notas-enviadas-list"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"

export default async function SupervisorNotasEquipePage() {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  if (usuario.tipo_acesso !== "Supervisor") {
    redirect("/")
  }

  let pedidos = []
  try {
    pedidos = await listarPedidosPorSupervisor(usuario.id)
  } catch (error) {
    console.error("[v0] Erro ao carregar pedidos da equipe:", error)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader eyebrow="Operação" title="Notas da equipe" description="Notas fiscais e pagamentos dos colaboradores da sua equipe." />

      <NotasEnviadasList pedidos={pedidos} canApprove={false} />
    </div>
  )
}
