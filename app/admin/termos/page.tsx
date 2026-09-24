import { listarRespostasTermoComercial, listarTermosComerciais } from "@/app/actions/termos-comerciais"
import { listarTenants } from "@/app/actions/tenants"
import { AdminTermosList } from "@/components/admin-termos-list"
import { AdminErroCarregamento } from "@/components/admin-erro-carregamento"
import { ehErroDeControleDoNext } from "@/lib/next-render-errors"

export default async function AdminTermosPage() {
  try {
    const [termos, tenants] = await Promise.all([listarTermosComerciais(), listarTenants()])

    // Abre mostrando as respostas da versão em vigor; sem ela, a última publicada.
    const selecionado =
      termos.find((t) => t.situacao === "em_vigor") ?? termos.find((t) => t.situacao === "arquivado") ?? null
    const respostas = selecionado ? await listarRespostasTermoComercial(selecionado.id) : []

    return (
      <AdminTermosList
        termosIniciais={termos}
        tenants={tenants.map((t: { id: string; nome: string }) => ({ id: t.id, nome: t.nome }))}
        termoSelecionadoInicial={selecionado?.id ?? null}
        respostasIniciais={respostas}
      />
    )
  } catch (error) {
    if (ehErroDeControleDoNext(error)) throw error
    console.error("[v0] Erro ao carregar /admin/termos:", error)
    return <AdminErroCarregamento mensagem={error instanceof Error ? error.message : undefined} />
  }
}
