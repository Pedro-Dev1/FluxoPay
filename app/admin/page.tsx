import { obterEstatisticasAdmin } from "@/app/actions/tenants"
import { AdminErroCarregamento } from "@/components/admin-erro-carregamento"
import { ehErroDeControleDoNext } from "@/lib/next-render-errors"

export default async function AdminOverviewPage() {
  let stats: { totalCarteiras: number; totalColaboradores: number; totalSuperAdmins: number }
  try {
    stats = await obterEstatisticasAdmin()
  } catch (error) {
    if (ehErroDeControleDoNext(error)) throw error
    console.error("[v0] Erro ao carregar /admin:", error)
    return <AdminErroCarregamento mensagem={error instanceof Error ? error.message : undefined} />
  }

  const mediaPorCarteira = stats.totalCarteiras > 0 ? stats.totalColaboradores / stats.totalCarteiras : 0

  // Uma métrica primária (base de usuários) e duas de apoio, numa faixa só.
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-[2fr_1fr_1fr]">
      <div className="bg-card p-5">
        <p className="type-eyebrow text-text-tertiary">Colaboradores nas carteiras</p>
        <p className="type-metric mt-2 text-foreground">{stats.totalColaboradores.toLocaleString("pt-BR")}</p>
        <p className="mt-1 text-xs tabular-nums text-text-tertiary">
          média de {mediaPorCarteira.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} por carteira
        </p>
      </div>
      <div className="bg-card p-5">
        <p className="type-eyebrow text-text-tertiary">Carteiras</p>
        <p className="mt-2 font-display text-2xl font-light tabular-nums text-foreground">{stats.totalCarteiras}</p>
      </div>
      <div className="bg-card p-5">
        <p className="type-eyebrow text-text-tertiary">Super Admins</p>
        <p className="mt-2 font-display text-2xl font-light tabular-nums text-foreground">{stats.totalSuperAdmins}</p>
      </div>
    </div>
  )
}
