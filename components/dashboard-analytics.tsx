"use client"

import { useState, useMemo, useEffect } from "react"
import type { PedidoPagamento } from "@/types/pedido"
import { StatusBadge } from "@/components/ui/status-badge"
import { PedidoDrawer } from "@/components/pedido-drawer"
import { Section } from "@/components/ui/section"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMaskedCurrency } from "@/components/currency-display"
import { SimplePager } from "@/components/ui/simple-pager"
import { Download, ChevronDown, ChevronRight, ChevronUp } from "lucide-react"

interface DashboardAnalyticsProps {
  // Já filtrado por quem chama (DashboardClient) — este componente só ordena, pagina e exibe.
  pedidos: PedidoPagamento[]
}

const STATUS_LABELS: Record<string, string> = {
  pendente_gerente: "Aguardando gerente",
  pendente_financeiro: "Aguardando financeiro",
  aprovado: "Aprovado",
  recusado: "Recusado",
  correcao: "Correção solicitada",
  pago: "Pago",
  nota_recebida: "Nota recebida",
  aguardando_prorrogacao: "Prorrogação solicitada",
  prorrogacao_negada: "Prorrogação negada",
  expirado: "Expirado",
}

function formatDateBR(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleDateString("pt-BR")
}

export function DashboardAnalytics({ pedidos }: DashboardAnalyticsProps) {
  const { formatValue, valoresVisiveis } = useMaskedCurrency()

  const [sortField, setSortField] = useState<string>("created_at")
  const [sortAsc, setSortAsc] = useState(false)
  const [selecionado, setSelecionado] = useState<PedidoPagamento | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Sort (a filtragem já vem pronta do componente pai)
  const sortedPedidos = useMemo(() => {
    const result = [...pedidos]
    result.sort((a, b) => {
      let valA: any, valB: any
      if (sortField === "created_at") {
        valA = a.created_at
        valB = b.created_at
      } else if (sortField === "valor_total") {
        valA = a.valor_total
        valB = b.valor_total
      } else if (sortField === "nome") {
        valA = (a.colaborador?.nome_completo || a.colaboradores?.nome_completo || "").toLowerCase()
        valB = (b.colaborador?.nome_completo || b.colaboradores?.nome_completo || "").toLowerCase()
      } else if (sortField === "status") {
        valA = a.status
        valB = b.status
      }
      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })
    return result
  }, [pedidos, sortField, sortAsc])

  // Volta pra página 1 sempre que o conjunto filtrado (vindo de fora) ou a
  // ordenação mudar — senão a página pode ficar "além do fim" da lista nova.
  useEffect(() => {
    setPage(1)
  }, [pedidos, sortField, sortAsc, pageSize])

  const pagedPedidos = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedPedidos.slice(start, start + pageSize)
  }, [sortedPedidos, page, pageSize])

  const filteredPedidos = sortedPedidos // export/contagem usam o conjunto completo, não só a página

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortAsc ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />
  }

  // Export Excel (XML Spreadsheet)
  const exportExcel = () => {
    const headers = [
      "Data",
      "Colaborador",
      "Equipe",
      "Centro de Custo",
      "Tipo",
      "Status",
      "Salário base",
      "HE 50% (h)",
      "HE 100% (h)",
      "Valor Horas Extras",
      "Reembolso KM",
      "Plantão",
      "Condução",
      "Comissão",
      "Desconto",
      "Valor Total",
      "Criado por",
      "Previsao Pagamento",
    ]

    const escXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    let xmlRows = ""
    // Header row
    xmlRows += "<Row>"
    headers.forEach((h) => {
      xmlRows += `<Cell><Data ss:Type="String">${escXml(h)}</Data></Cell>`
    })
    xmlRows += "</Row>"

    // Data rows
    filteredPedidos.forEach((p) => {
      const colab = p.colaborador || p.colaboradores
      const nome = colab?.nome_completo || ""
      const equipeNome = (colab as any)?.equipe?.nome || ""
      const ccNome = (colab as any)?.centro_custo ? `${(colab as any).centro_custo.numero} - ${(colab as any).centro_custo.nome}` : ""
      const tipo = p.tipo_pedido === "reembolso_km" ? "Reembolso de KM" : "Completo"
      const salarioBase = p.tipo_pedido === "reembolso_km" ? 0 : (p.salario_base ?? colab?.salario ?? 0)
      const he50h = p.horas_extras_50 || 0
      const he100h = p.horas_extras_100 || 0
      const valorHe = p.horas_extras || 0
      const criadoPor = p.criado_por?.nome_completo || ""
      const previsao = p.data_previsao_pagamento ? formatDateBR(p.data_previsao_pagamento) : ""

      xmlRows += "<Row>"
      xmlRows += `<Cell><Data ss:Type="String">${escXml(formatDateBR(p.created_at))}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="String">${escXml(nome)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="String">${escXml(equipeNome)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="String">${escXml(ccNome)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="String">${escXml(tipo)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="String">${escXml(STATUS_LABELS[p.status] || p.status)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${salarioBase.toFixed(2)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${he50h}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${he100h}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${valorHe.toFixed(2)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${(p.valor_km || 0).toFixed(2)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${(p.valor_plantao || 0).toFixed(2)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${(p.conducao || 0).toFixed(2)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${(p.comissao || 0).toFixed(2)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${(p.valor_desconto || 0).toFixed(2)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="Number">${p.valor_total.toFixed(2)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="String">${escXml(criadoPor)}</Data></Cell>`
      xmlRows += `<Cell><Data ss:Type="String">${escXml(previsao)}</Data></Cell>`
      xmlRows += "</Row>"
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Relatório">
    <Table>${xmlRows}</Table>
  </Worksheet>
</Workbook>`

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fluxteme_relatorio_${new Date().toISOString().split("T")[0]}.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters + Table */}
      <Section
        title="Todos os pedidos"
        description={`${filteredPedidos.length} ${filteredPedidos.length === 1 ? "pedido" : "pedidos"} no filtro atual`}
        action={
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={filteredPedidos.length === 0}>
            <Download />
            Exportar planilha
          </Button>
        }
      >
          {filteredPedidos.length === 0 ? (
            <div className="rounded-lg border border-border bg-card">
              <EmptyState
                compact
                title="Nenhum pedido no período"
                description="Amplie o período ou limpe os filtros acima. Pedidos lançados aparecem aqui assim que são criados."
              />
            </div>
          ) : (
          <>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      aria-sort={sortField === "created_at" ? (sortAsc ? "ascending" : "descending") : "none"}
                    >
                      <button type="button" onClick={() => handleSort("created_at")} className="inline-flex items-center uppercase hover:text-foreground">
                        Data <SortIcon field="created_at" />
                      </button>
                    </TableHead>
                    <TableHead
                      aria-sort={sortField === "nome" ? (sortAsc ? "ascending" : "descending") : "none"}
                    >
                      <button type="button" onClick={() => handleSort("nome")} className="inline-flex items-center uppercase hover:text-foreground">
                        Colaborador <SortIcon field="nome" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Equipe</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead
                      aria-sort={sortField === "status" ? (sortAsc ? "ascending" : "descending") : "none"}
                    >
                      <button type="button" onClick={() => handleSort("status")} className="inline-flex items-center uppercase hover:text-foreground">
                        Status <SortIcon field="status" />
                      </button>
                    </TableHead>
                    <TableHead
                      aria-sort={sortField === "valor_total" ? (sortAsc ? "ascending" : "descending") : "none"}
                      className="text-right"
                    >
                      <button type="button" onClick={() => handleSort("valor_total")} className="inline-flex items-center uppercase hover:text-foreground">
                        Valor total <SortIcon field="valor_total" />
                      </button>
                    </TableHead>
                    <TableHead className="w-8">
                      <span className="sr-only">Detalhes</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedPedidos.map((p) => {
                    const colab = p.colaborador || p.colaboradores
                    return (
                      <TableRow
                        key={p.id}
                        className="group cursor-pointer"
                        onClick={() => setSelecionado(p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setSelecionado(p)
                          }
                        }}
                        tabIndex={0}
                        aria-label={`Ver detalhes do pedido de ${colab?.nome_completo ?? "colaborador"}`}
                      >
                        <TableCell className="type-audit whitespace-nowrap text-text-secondary">{formatDateBR(p.created_at)}</TableCell>
                        <TableCell className="max-w-[16rem] truncate text-sm font-medium text-foreground">
                          {colab?.nome_completo || "Não identificado"}
                        </TableCell>
                        <TableCell className="hidden max-w-[10rem] truncate text-sm text-text-secondary lg:table-cell">
                          {(colab as any)?.equipe?.nome || "Sem equipe"}
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">
                          {p.tipo_pedido === "reembolso_km" ? "Reembolso de KM" : "Completo"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-sm font-medium tabular-nums text-foreground">
                          {formatValue(p.valor_total)}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-text-tertiary transition-colors group-hover:text-foreground" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <SimplePager
            page={page}
            pageSize={pageSize}
            totalItems={filteredPedidos.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
          </>
          )}
        <PedidoDrawer pedido={selecionado} onOpenChange={(aberto) => !aberto && setSelecionado(null)} />
      </Section>
    </div>
  )
}
