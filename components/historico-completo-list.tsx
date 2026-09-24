"use client"

import { useEffect, useMemo, useState } from "react"
import type { PedidoPagamento } from "@/types/pedido"
import type { Equipe } from "@/types/equipe"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { AuditTimestamp } from "@/components/ui/audit"
import { ChevronRight, History, Search, X } from "lucide-react"
import { SimplePager } from "@/components/ui/simple-pager"
import { useMaskedCurrency } from "@/components/currency-display"
import { PedidoDrawer } from "@/components/pedido-drawer"

interface HistoricoCompletoListProps {
  pedidos: PedidoPagamento[]
  equipes: Equipe[]
}

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "pendente_gerente", label: "Aguardando gerente" },
  { value: "pendente_financeiro", label: "Aguardando financeiro" },
  { value: "aprovado", label: "Aprovado" },
  { value: "pago", label: "Pago" },
  { value: "nota_recebida", label: "Nota recebida" },
  { value: "recusado", label: "Recusado" },
  { value: "correcao", label: "Correção solicitada" },
  { value: "aguardando_prorrogacao", label: "Prorrogação solicitada" },
  { value: "prorrogacao_negada", label: "Prorrogação negada" },
  { value: "expirado", label: "Expirado" },
]

export function HistoricoCompletoList({ pedidos, equipes }: HistoricoCompletoListProps) {
  const { formatValue } = useMaskedCurrency()
  const [selecionado, setSelecionado] = useState<PedidoPagamento | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const [busca, setBusca] = useState("")
  const [equipeFiltro, setEquipeFiltro] = useState("todas")
  const [statusFiltro, setStatusFiltro] = useState("todos")

  const filtrosAtivos = !!busca || equipeFiltro !== "todas" || statusFiltro !== "todos"

  const pedidosFiltrados = useMemo(() => {
    let result = pedidos
    if (busca) {
      const q = busca.toLowerCase()
      result = result.filter((p) => p.colaborador?.nome_completo?.toLowerCase().includes(q))
    }
    if (equipeFiltro === "sem-equipe") {
      result = result.filter((p) => !p.colaborador?.equipe_id)
    } else if (equipeFiltro !== "todas") {
      result = result.filter((p) => p.colaborador?.equipe_id === equipeFiltro)
    }
    if (statusFiltro !== "todos") {
      result = result.filter((p) => p.status === statusFiltro)
    }
    return result
  }, [pedidos, busca, equipeFiltro, statusFiltro])

  useEffect(() => {
    setPage(1)
  }, [busca, equipeFiltro, statusFiltro, pageSize])

  const pedidosPaginados = pedidosFiltrados.slice((page - 1) * pageSize, page * pageSize)
  const totalFiltrado = pedidosFiltrados.reduce((s, p) => s + p.valor_total, 0)

  const limparFiltros = () => {
    setBusca("")
    setEquipeFiltro("todas")
    setStatusFiltro("todos")
  }

  const stats = {
    total: pedidos.length,
    valorTotal: pedidos.reduce((acc, p) => acc + p.valor_total, 0),
    aprovados: pedidos.filter((p) => p.status === "aprovado").length,
    pendentes: pedidos.filter((p) => p.status.includes("pendente")).length,
  }

  if (pedidos.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nenhum pedido registrado ainda"
        description="Quando supervisores e gerentes lançarem pedidos de pagamento, cada um aparece aqui com sua trilha completa."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Uma métrica primária (valor) e três de apoio, na mesma faixa */}
      <div className="grid overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-[2fr_1fr_1fr_1fr] gap-px">
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Valor total lançado</p>
          <p className="type-metric mt-2 text-foreground">{formatValue(stats.valorTotal)}</p>
          <p className="mt-1 text-xs tabular-nums text-text-tertiary">
            em {stats.total} {stats.total === 1 ? "pedido" : "pedidos"}
          </p>
        </div>
        <Indicador rotulo="Pedidos" valor={stats.total} />
        <Indicador rotulo="Aprovados" valor={stats.aprovados} tom="text-success" />
        <Indicador rotulo="Aguardando decisão" valor={stats.pendentes} tom={stats.pendentes > 0 ? "text-warning" : undefined} />
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b border-border pb-4">
        <div className="w-full space-y-1.5 sm:w-64">
          <Label htmlFor="h-busca">Colaborador</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input id="h-busca" placeholder="Nome do colaborador" value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Equipe</Label>
          <Select value={equipeFiltro} onValueChange={setEquipeFiltro}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="sem-equipe">Sem equipe</SelectItem>
              {equipes.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filtrosAtivos && (
          <Button variant="ghost" onClick={limparFiltros}>
            <X />
            Limpar filtros
          </Button>
        )}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <EmptyState
          compact
          title="Nenhum pedido com esses filtros"
          description="Troque a equipe, o status ou a busca por colaborador."
          action={
            <Button variant="outline" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div>
          <p className="mb-3 text-sm text-text-secondary">
            <span className="font-medium tabular-nums text-foreground">{pedidosFiltrados.length}</span>{" "}
            {pedidosFiltrados.length === 1 ? "pedido" : "pedidos"} ·{" "}
            <span className="font-medium tabular-nums text-foreground">{formatValue(totalFiltrado)}</span>
            <span className="text-text-tertiary"> · selecione uma linha para ver evidências e trilha</span>
          </p>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead className="hidden md:table-cell">Lançado por</TableHead>
                  <TableHead className="hidden sm:table-cell">Lançado em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor total</TableHead>
                  <TableHead className="w-8">
                    <span className="sr-only">Abrir</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosPaginados.map((pedido) => (
                  <TableRow
                    key={pedido.id}
                    className="group cursor-pointer"
                    onClick={() => setSelecionado(pedido)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelecionado(pedido)
                      }
                    }}
                    tabIndex={0}
                    aria-label={`Ver trilha do pedido de ${pedido.colaborador?.nome_completo ?? "colaborador"}`}
                  >
                    <TableCell className="max-w-[16rem] truncate text-sm font-medium text-foreground">
                      {pedido.colaborador?.nome_completo || "Não identificado"}
                    </TableCell>
                    <TableCell className="hidden max-w-[12rem] truncate text-sm text-text-secondary md:table-cell">
                      {pedido.criado_por?.nome_completo || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <AuditTimestamp valor={pedido.created_at} className="text-text-secondary" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={pedido.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm font-medium tabular-nums text-foreground">
                      {formatValue(pedido.valor_total)}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-text-tertiary transition-colors group-hover:text-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="py-2 type-eyebrow text-text-tertiary">
                    Total do filtro
                  </TableCell>
                  <TableCell colSpan={2} className="whitespace-nowrap py-2 text-right text-sm font-semibold tabular-nums">
                    {formatValue(totalFiltrado)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <SimplePager
            page={page}
            pageSize={pageSize}
            totalItems={pedidosFiltrados.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      <PedidoDrawer pedido={selecionado} onOpenChange={(aberto) => !aberto && setSelecionado(null)} />
    </div>
  )
}

function Indicador({ rotulo, valor, tom }: { rotulo: string; valor: number; tom?: string }) {
  return (
    <div className="bg-card p-5">
      <p className="type-eyebrow text-text-tertiary">{rotulo}</p>
      <p className={`mt-2 text-2xl font-light tabular-nums font-display ${tom ?? "text-foreground"}`}>{valor}</p>
    </div>
  )
}
