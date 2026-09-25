"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Search, UserRoundX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusIndicator } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { SimplePager } from "@/components/ui/simple-pager"
import { alterarStatusAtivoColaborador, type UsuarioSituacao } from "@/app/actions/colaboradores"

const CARGOS = ["Colaborador", "Supervisor", "Gerente", "Financeiro", "Adm"]
const DATA = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" })
const DIA_MS = 86400000

function diasDesde(iso: string | null) {
  return iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DIA_MS) : null
}

export function UsuariosSituacaoList({ usuarios, usuarioLogadoId }: { usuarios: UsuarioSituacao[]; usuarioLogadoId: string }) {
  const router = useRouter()
  const [situacao, setSituacao] = useState<"todos" | "ativos" | "inativos">("ativos")
  const [cargo, setCargo] = useState("todos")
  const [equipe, setEquipe] = useState("todas")
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [alvo, setAlvo] = useState<UsuarioSituacao | null>(null)
  const [salvando, setSalvando] = useState(false)

  const equipes = useMemo(
    () => Array.from(new Set(usuarios.map((u) => u.equipe?.nome).filter(Boolean) as string[])).sort(),
    [usuarios],
  )

  const contagem = useMemo(() => {
    const ativos = usuarios.filter((u) => u.ativo)
    return {
      total: usuarios.length,
      ativos: ativos.length,
      inativos: usuarios.length - ativos.length,
      // Ativos sem nenhum pedido nos últimos 90 dias: candidatos a revisão
      semMovimento: ativos.filter((u) => u.tipo_acesso === "Colaborador" && (diasDesde(u.ultimo_pedido) ?? Infinity) > 90).length,
    }
  }, [usuarios])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return usuarios.filter(
      (u) =>
        (situacao === "todos" || (situacao === "ativos" ? u.ativo : !u.ativo)) &&
        (cargo === "todos" || u.tipo_acesso === cargo) &&
        (equipe === "todas" || (equipe === "sem-equipe" ? !u.equipe : u.equipe?.nome === equipe)) &&
        (!q || u.nome_completo.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    )
  }, [usuarios, situacao, cargo, equipe, busca])

  const pagina = filtrados.slice((page - 1) * pageSize, page * pageSize)
  const filtrosAtivos = cargo !== "todos" || equipe !== "todas" || !!busca

  const limpar = () => {
    setCargo("todos")
    setEquipe("todas")
    setBusca("")
    setPage(1)
  }

  const confirmar = async () => {
    if (!alvo) return
    setSalvando(true)
    try {
      await alterarStatusAtivoColaborador(alvo.id, !alvo.ativo)
      toast.success(alvo.ativo ? "Usuário desativado" : "Usuário reativado", { description: alvo.nome_completo })
      setAlvo(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível alterar a situação. Tente de novo.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-[2fr_1fr_1fr]">
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Usuários ativos</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="type-metric text-foreground">{contagem.ativos}</span>
            <span className="text-sm tabular-nums text-text-secondary">de {contagem.total} cadastrados</span>
          </p>
          <p className="mt-1 text-xs text-text-tertiary">Só usuários ativos entram no sistema e aparecem para novos lançamentos.</p>
        </div>
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Inativos</p>
          <p className="mt-2 font-display text-3xl font-light tabular-nums text-foreground">{contagem.inativos}</p>
          <p className="mt-1 text-xs text-text-tertiary">Histórico preservado</p>
        </div>
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Ativos sem pedido há 90 dias</p>
          <p className={`mt-2 font-display text-3xl font-light tabular-nums ${contagem.semMovimento > 0 ? "text-warning" : "text-foreground"}`}>
            {contagem.semMovimento}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">Colaboradores para revisar</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b border-border pb-4">
        <div role="group" aria-label="Situação" className="inline-flex rounded-control border border-border-strong bg-card p-0.5">
          {(
            [
              ["ativos", `Ativos · ${contagem.ativos}`],
              ["inativos", `Inativos · ${contagem.inativos}`],
              ["todos", "Todos"],
            ] as const
          ).map(([id, rotulo]) => (
            <button
              key={id}
              type="button"
              aria-pressed={situacao === id}
              onClick={() => {
                setSituacao(id)
                setPage(1)
              }}
              className={`h-7 whitespace-nowrap rounded-[3px] px-2.5 text-[13px] tabular-nums transition-colors duration-150 ${
                situacao === id ? "bg-accent font-medium text-accent-foreground" : "text-text-secondary hover:bg-surface hover:text-foreground"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>
        <div className="w-full space-y-1.5 sm:w-60">
          <Label htmlFor="u-busca">Nome ou e-mail</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              id="u-busca"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Cargo</Label>
          <Select value={cargo} onValueChange={(v) => (setCargo(v), setPage(1))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {CARGOS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Equipe</Label>
          <Select value={equipe} onValueChange={(v) => (setEquipe(v), setPage(1))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="sem-equipe">Sem equipe</SelectItem>
              {equipes.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filtrosAtivos && (
          <Button variant="ghost" onClick={limpar}>
            <X />
            Limpar filtros
          </Button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={UserRoundX}
          compact
          title={situacao === "inativos" && !filtrosAtivos ? "Nenhum usuário inativo" : "Nenhum usuário com esses filtros"}
          description={
            situacao === "inativos" && !filtrosAtivos
              ? "Usuários desativados aparecem aqui, com o histórico preservado, e podem ser reativados a qualquer momento."
              : "Troque a situação, o cargo, a equipe ou a busca."
          }
        />
      ) : (
        <div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="hidden md:table-cell">Equipe</TableHead>
                  <TableHead className="hidden sm:table-cell">Último pedido</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Ação</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagina.map((u) => {
                  const dias = diasDesde(u.ultimo_pedido)
                  const proprio = u.id === usuarioLogadoId
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="max-w-[18rem]">
                        <p className="truncate text-sm font-medium text-foreground" title={u.nome_completo}>
                          {u.nome_completo}
                          {proprio && <span className="ml-1.5 text-xs font-normal text-text-tertiary">(você)</span>}
                        </p>
                        <p className="truncate text-xs text-text-tertiary" title={u.email}>
                          {u.email}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">{u.tipo_acesso}</TableCell>
                      <TableCell className="hidden max-w-[12rem] truncate text-sm text-text-secondary md:table-cell">
                        {u.equipe?.nome ?? "Sem equipe"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {u.ultimo_pedido ? (
                          <span className="type-audit text-text-secondary" title={`há ${dias} dias`}>
                            {DATA.format(new Date(u.ultimo_pedido))}
                          </span>
                        ) : (
                          <span className="text-xs text-text-tertiary">Nenhum</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusIndicator status={u.ativo ? "ativo" : "inativo"} />
                      </TableCell>
                      <TableCell className="text-right">
                        {!proprio && (
                          <Button variant={u.ativo ? "ghost" : "outline"} size="sm" onClick={() => setAlvo(u)}>
                            {u.ativo ? "Desativar" : "Reativar"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <SimplePager page={page} pageSize={pageSize} totalItems={filtrados.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
        </div>
      )}

      <ConfirmDialog
        open={!!alvo}
        onOpenChange={(aberto) => !aberto && setAlvo(null)}
        title={alvo?.ativo ? `Desativar ${alvo?.nome_completo}?` : `Reativar ${alvo?.nome_completo}?`}
        consequence={
          alvo?.ativo ? (
            <>
              A pessoa deixa de conseguir entrar no sistema e não aparece para novos lançamentos. Pedidos, notas e a trilha
              de auditoria continuam guardados. Dá para reativar a qualquer momento.
            </>
          ) : (
            <>A pessoa volta a entrar com o mesmo e-mail e senha e aparece de novo para lançamentos.</>
          )
        }
        confirmLabel={alvo?.ativo ? "Desativar usuário" : "Reativar usuário"}
        destructive={alvo?.ativo}
        loading={salvando}
        onConfirm={confirmar}
      />
    </div>
  )
}
