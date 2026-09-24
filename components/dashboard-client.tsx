"use client"

import { useEffect, useMemo, useState } from "react"
import type { PedidoPagamento } from "@/types/pedido"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ListFilter, Search, X } from "lucide-react"
import { DashboardResumo, type AcaoAgoraItem } from "@/components/dashboard-resumo"
import { DashboardAnalytics } from "@/components/dashboard-analytics"

interface DashboardClientProps {
  pedidos: PedidoPagamento[]
  equipes: Array<{ id: string; nome: string }>
  tipoAcesso: string
  acaoAgoraItens: AcaoAgoraItem[]
  acaoAgoraMaisAntigo: { nome: string; tipo: string; createdAt: string } | null
}

export function DashboardClient({
  pedidos,
  equipes,
  tipoAcesso,
  acaoAgoraItens,
  acaoAgoraMaisAntigo,
}: DashboardClientProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [busca, setBusca] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [equipeFilter, setEquipeFilter] = useState("todas")

  const setPreset = (dias: number) => {
    const fim = new Date()
    const inicio = new Date()
    inicio.setDate(inicio.getDate() - dias)
    setDataInicio(inicio.toISOString().split("T")[0])
    setDataFim(fim.toISOString().split("T")[0])
  }

  const setMonthPreset = () => {
    const agora = new Date()
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
    setDataInicio(inicio.toISOString().split("T")[0])
    setDataFim(agora.toISOString().split("T")[0])
  }

  const clearFilters = () => {
    setDataInicio("")
    setDataFim("")
    setBusca("")
    setStatusFilter("todos")
    setTipoFilter("todos")
    setEquipeFilter("todas")
  }

  const filtrosAtivos =
    !!dataInicio || !!dataFim || !!busca || statusFilter !== "todos" || tipoFilter !== "todos" || equipeFilter !== "todas"

  const filteredPedidos = useMemo(() => {
    let result = pedidos

    if (dataInicio) {
      result = result.filter((p) => p.created_at >= dataInicio)
    }
    if (dataFim) {
      const fim = new Date(dataFim)
      fim.setDate(fim.getDate() + 1)
      result = result.filter((p) => p.created_at < fim.toISOString())
    }
    if (busca) {
      const q = busca.toLowerCase()
      result = result.filter(
        (p) =>
          p.colaborador?.nome_completo?.toLowerCase().includes(q) ||
          p.colaboradores?.nome_completo?.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== "todos") {
      result = result.filter((p) => p.status === statusFilter)
    }
    if (tipoFilter !== "todos") {
      if (tipoFilter === "reembolso_km") {
        result = result.filter((p) => p.tipo_pedido === "reembolso_km")
      } else if (tipoFilter === "horas_extras") {
        result = result.filter((p) => (p.horas_extras_50 || 0) > 0 || (p.horas_extras_100 || 0) > 0)
      } else if (tipoFilter === "plantao") {
        result = result.filter((p) => (p.valor_plantao || 0) > 0)
      } else if (tipoFilter === "conducao") {
        result = result.filter((p) => (p.conducao || 0) > 0)
      }
    }
    if (equipeFilter !== "todas") {
      result = result.filter((p) => {
        const colab = (p.colaborador || p.colaboradores) as any
        if (equipeFilter === "sem-equipe") return !colab?.equipe_id
        return colab?.equipe_id === equipeFilter
      })
    }

    return result
  }, [pedidos, dataInicio, dataFim, busca, statusFilter, tipoFilter, equipeFilter])

  const periodoAtivo = (() => {
    if (!dataInicio && !dataFim) return "tudo"
    const hoje = new Date().toISOString().split("T")[0]
    if (dataFim !== hoje) return null
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    if (dataInicio === inicioMes) return "mes"
    const dias = Math.round((new Date(hoje).getTime() - new Date(dataInicio).getTime()) / 86400000)
    return [7, 30, 90].includes(dias) ? String(dias) : null
  })()

  const PERIODOS = [
    { id: "7", rotulo: "7 dias", aplicar: () => setPreset(7) },
    { id: "30", rotulo: "30 dias", aplicar: () => setPreset(30) },
    { id: "90", rotulo: "90 dias", aplicar: () => setPreset(90) },
    { id: "mes", rotulo: "Este mês", aplicar: setMonthPreset },
    {
      id: "tudo",
      rotulo: "Todo o período",
      aplicar: () => {
        setDataInicio("")
        setDataFim("")
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Período" className="inline-flex max-w-full overflow-x-auto rounded-control border border-border-strong bg-card p-0.5">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={p.aplicar}
                aria-pressed={periodoAtivo === p.id}
                className={cn(
                  "h-7 shrink-0 whitespace-nowrap rounded-[3px] px-2.5 text-[13px] transition-colors duration-150",
                  periodoAtivo === p.id
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-text-secondary hover:bg-surface hover:text-foreground",
                )}
              >
                {p.rotulo}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filtros-dashboard"
          >
            <ListFilter />
            Filtros
            {filtrosAtivos && <span className="type-audit text-text-tertiary">{filteredPedidos.length} de {pedidos.length}</span>}
          </Button>
          {filtrosAtivos && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X />
              Limpar filtros
            </Button>
          )}
        </div>

        {showFilters && (
          <div id="filtros-dashboard" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="f-busca">Colaborador</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <Input id="f-busca" placeholder="Nome do colaborador" value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-inicio">De</Label>
              <Input id="f-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-fim">Até</Label>
              <Input id="f-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente_gerente">Aguardando gerente</SelectItem>
                  <SelectItem value="pendente_financeiro">Aguardando financeiro</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="nota_recebida">Nota recebida</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="recusado">Recusado</SelectItem>
                  <SelectItem value="correcao">Correção solicitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de lançamento</Label>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="reembolso_km">Reembolso de KM</SelectItem>
                  <SelectItem value="horas_extras">Horas extras</SelectItem>
                  <SelectItem value="plantao">Plantão</SelectItem>
                  <SelectItem value="conducao">Condução</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label>Equipe</Label>
              <Select value={equipeFilter} onValueChange={setEquipeFilter}>
                <SelectTrigger className="w-full">
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
          </div>
        )}
      </div>

      <DashboardResumo
        pedidos={filteredPedidos}
        equipes={equipes}
        tipoAcesso={tipoAcesso}
        acaoAgoraItens={acaoAgoraItens}
        acaoAgoraMaisAntigo={acaoAgoraMaisAntigo}
      />

      <DashboardAnalytics pedidos={filteredPedidos} />
    </div>
  )
}
