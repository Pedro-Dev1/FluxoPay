import { ScrollText } from "lucide-react"
import { listarAuditoria } from "@/app/actions/tenants"
import { EmptyState } from "@/components/ui/empty-state"
import { AdminErroCarregamento } from "@/components/admin-erro-carregamento"
import { ehErroDeControleDoNext } from "@/lib/next-render-errors"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AuditTimestamp } from "@/components/ui/audit"

const ACAO_LABELS: Record<string, string> = {
  carteira_criada: "Carteira criada",
  carteira_ativada: "Carteira ativada",
  carteira_desativada: "Carteira desativada",
  super_admin_promovido: "Super Admin promovido",
  super_admin_revogado: "Super Admin revogado",
  login_super_admin: "Login de Super Admin",
  faturamento_configurado: "Faturamento configurado",
  fatura_plataforma_emitida: "Fatura emitida",
  fatura_plataforma_paga: "Fatura paga",
  fatura_plataforma_falhou: "Falha ao emitir fatura",
  fatura_plataforma_cancelada: "Fatura cancelada",
  termo_comercial_criado: "Termo comercial criado",
  termo_comercial_editado: "Rascunho de termo editado",
  termo_comercial_publicado: "Termo comercial publicado",
  termo_comercial_arquivado: "Termo comercial arquivado",
  termo_comercial_rascunho_excluido: "Rascunho de termo excluído",
}

function nomeRelacionado(rel: any): string {
  if (!rel) return "—"
  const item = Array.isArray(rel) ? rel[0] : rel
  return item?.nome_completo || item?.nome || item?.email || "—"
}

/** Detalhes do evento como pares chave=valor, legíveis e verificáveis. */
function Detalhes({ detalhes }: { detalhes: Record<string, unknown> | null }) {
  if (!detalhes || Object.keys(detalhes).length === 0) return <span className="text-text-tertiary">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(detalhes).map(([k, v]) => (
        <span key={k} className="type-audit rounded-control bg-surface px-1.5 py-0.5 text-text-secondary">
          {k}=<span className="text-foreground">{typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}</span>
        </span>
      ))}
    </div>
  )
}

// Trilha de auditoria da plataforma (DESIGN_SYSTEM.md §36): registro
// append-only de ações privilegiadas, em ordem, com autor e instante exato.
export default async function AdminAuditoriaPage() {
  let registros: any[]
  try {
    registros = await listarAuditoria()
  } catch (error) {
    if (ehErroDeControleDoNext(error)) throw error
    console.error("[v0] Erro ao carregar /admin/auditoria:", error)
    return <AdminErroCarregamento mensagem={error instanceof Error ? error.message : undefined} />
  }

  if (registros.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="Nenhuma ação privilegiada registrada ainda"
        description="Criação de carteira, promoção de Super Admin, faturamento e publicação de termos aparecem aqui, com autor e horário."
      />
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary">
        <span className="font-medium tabular-nums text-foreground">{registros.length}</span> registros · horário de Brasília
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead>
              <TableHead>Quem</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Carteira</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="align-top">
                  <AuditTimestamp valor={r.created_at} />
                </TableCell>
                <TableCell className="max-w-[12rem] truncate align-top text-sm">{nomeRelacionado(r.colaborador)}</TableCell>
                <TableCell className="align-top text-sm font-medium">{ACAO_LABELS[r.acao] || r.acao}</TableCell>
                <TableCell className="max-w-[10rem] truncate align-top text-sm text-text-secondary">{nomeRelacionado(r.tenant)}</TableCell>
                <TableCell className="max-w-md align-top">
                  <Detalhes detalhes={r.detalhes} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
