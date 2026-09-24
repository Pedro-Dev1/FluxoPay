"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { PedidoPagamento } from "@/types/pedido"
import { Card } from "@/components/ui/card"
import { useMaskedCurrency } from "@/components/currency-display"
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export interface AcaoAgoraItem {
  label: string
  count: number
  href: string
}

interface AcaoAgoraMaisAntigo {
  nome: string
  tipo: string
  createdAt: string
}

interface DashboardResumoProps {
  pedidos: PedidoPagamento[]
  equipes: Array<{ id: string; nome: string }>
  tipoAcesso: string
  acaoAgoraItens: AcaoAgoraItem[]
  acaoAgoraMaisAntigo: AcaoAgoraMaisAntigo | null
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

function diasAtras(dataISO: string): number {
  const ms = Date.now() - new Date(dataISO).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

function colaboradorDe(p: PedidoPagamento) {
  return p.colaborador || p.colaboradores
}

export function DashboardResumo({
  pedidos,
  equipes,
  tipoAcesso,
  acaoAgoraItens,
  acaoAgoraMaisAntigo,
}: DashboardResumoProps) {
  const { formatValue, valoresVisiveis } = useMaskedCurrency()

  const totalAcaoAgora = acaoAgoraItens.reduce((s, i) => s + i.count, 0)

  // Valor total do período (mês corrente) x mês anterior, a partir dos mesmos
  // pedidos já carregados na página — sem query nova.
  const comparacaoMensal = useMemo(() => {
    const agora = new Date()
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)

    let totalAtual = 0
    let countAtual = 0
    let totalAnterior = 0
    let temMesAnterior = false

    pedidos.forEach((p) => {
      const d = new Date(p.created_at)
      if (d >= inicioMesAtual) {
        totalAtual += p.valor_total
        countAtual += 1
      } else if (d >= inicioMesAnterior && d < inicioMesAtual) {
        totalAnterior += p.valor_total
        temMesAnterior = true
      }
    })

    const deltaPct = temMesAnterior && totalAnterior !== 0 ? ((totalAtual - totalAnterior) / totalAnterior) * 100 : null

    return { totalAtual, countAtual, totalAnterior, temMesAnterior, deltaPct }
  }, [pedidos])

  // Sequência do fluxo — contagem pelo status real do sistema (não o vocabulário
  // genérico de "agendado", que não existe aqui: o que existe é aprovado ->
  // nota recebida -> pago, com recusado como ramo lateral).
  const sequenciaFluxo = useMemo(() => {
    const contagem = { aprovado: 0, notaRecebida: 0, pago: 0, recusado: 0 }
    pedidos.forEach((p) => {
      if (p.status === "aprovado") contagem.aprovado += 1
      else if (p.status === "nota_recebida") contagem.notaRecebida += 1
      else if (p.status === "pago") contagem.pago += 1
      else if (p.status === "recusado") contagem.recusado += 1
    })
    return contagem
  }, [pedidos])

  // Cortes: por equipe, por centro de custo, por prestador (top 5 cada)
  const cortes = useMemo(() => {
    const porEquipe = new Map<string, number>()
    const porCentroCusto = new Map<string, number>()
    const porPrestador = new Map<string, number>()

    pedidos.forEach((p) => {
      const colab = colaboradorDe(p) as any
      const nomeEquipe = colab?.equipe?.nome || "Sem equipe"
      porEquipe.set(nomeEquipe, (porEquipe.get(nomeEquipe) || 0) + p.valor_total)

      const cc = colab?.centro_custo ? `${colab.centro_custo.numero} - ${colab.centro_custo.nome}` : "Sem centro de custo"
      porCentroCusto.set(cc, (porCentroCusto.get(cc) || 0) + p.valor_total)

      const nomePrestador = colab?.nome_completo || "N/A"
      porPrestador.set(nomePrestador, (porPrestador.get(nomePrestador) || 0) + p.valor_total)
    })

    const top = (m: Map<string, number>, n: number) =>
      Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)

    return {
      equipes: top(porEquipe, 5),
      centrosCusto: top(porCentroCusto, 5),
      prestadores: top(porPrestador, 5),
    }
  }, [pedidos])

  // Composição: soma bruta de cada tipo de gasto no conjunto filtrado — a
  // mesma informação que existia como cards separados antes do redesenho,
  // agora como uma faixa de detalhe em vez de métricas de topo.
  const composicao = useMemo(() => {
    let salario = 0
    let horasExtras = 0
    let reembolsoKm = 0
    let plantao = 0
    let conducao = 0
    let comissao = 0

    pedidos.forEach((p) => {
      if (p.tipo_pedido === "reembolso_km") {
        reembolsoKm += p.valor_km || 0
      } else {
        const colab = colaboradorDe(p) as any
        salario += p.salario_base ?? colab?.salario ?? 0
        horasExtras += p.horas_extras || 0
        reembolsoKm += p.valor_km || 0
        plantao += p.valor_plantao || 0
        conducao += p.conducao || 0
        comissao += p.comissao || 0
      }
    })

    return { salario, horasExtras, reembolsoKm, plantao, conducao, comissao }
  }, [pedidos])

  // Evolução mensal: solicitado (tudo) x aprovado+ (aprovado/nota_recebida/pago) x pago
  const evolucaoMensal = useMemo(() => {
    const meses = new Map<string, { label: string; solicitado: number; aprovado: number; pago: number }>()

    pedidos.forEach((p) => {
      const d = new Date(p.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
      if (!meses.has(key)) meses.set(key, { label, solicitado: 0, aprovado: 0, pago: 0 })
      const bucket = meses.get(key)!
      bucket.solicitado += p.valor_total
      if (["aprovado", "nota_recebida", "pago"].includes(p.status)) bucket.aprovado += p.valor_total
      if (p.status === "pago") bucket.pago += p.valor_total
    })

    return Array.from(meses.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
  }, [pedidos])

  const acaoAgoraLabel =
    tipoAcesso === "Gerente" || tipoAcesso === "Supervisor" ? "aguardando você" : "no seu radar hoje"

  const tooltipValor = (v: number) => (valoresVisiveis ? formatValue(v) : "R$ ------")

  return (
    <div className="space-y-4">
      {/* Bloco 1: requer ação agora */}
      {totalAcaoAgora > 0 && (
        <section
          aria-label="Exige ação"
          className="rounded-lg border border-warning/30 border-l-2 border-l-warning bg-warning-subtle p-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="type-eyebrow text-warning">Exige ação</p>
              <p className="mt-1 text-sm text-foreground">
                <span className="type-metric mr-2 text-3xl text-foreground">{totalAcaoAgora}</span>
                {totalAcaoAgora === 1 ? "pedido" : "pedidos"} {acaoAgoraLabel}
              </p>
            </div>
            {acaoAgoraMaisAntigo && (
              <p className="text-xs text-text-secondary">
                Mais antigo: <span className="font-medium text-foreground">{acaoAgoraMaisAntigo.nome}</span> ·{" "}
                {acaoAgoraMaisAntigo.tipo} · há{" "}
                <span className="tabular-nums">{diasAtras(acaoAgoraMaisAntigo.createdAt)}</span>{" "}
                {diasAtras(acaoAgoraMaisAntigo.createdAt) === 1 ? "dia" : "dias"}
              </p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {acaoAgoraItens
              .filter((i) => i.count > 0)
              .map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex h-8 items-center gap-2 rounded-control border border-border-strong bg-card px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-surface"
                >
                  <span className="font-mono text-xs tabular-nums text-warning">{item.count}</span>
                  {item.label}
                  <ArrowRight className="h-3.5 w-3.5 text-text-tertiary" />
                </Link>
              ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bloco 2: métrica primária */}
        <Card className="lg:col-span-2">
          <div className="p-5">
            <p className="type-eyebrow text-text-tertiary">Valor lançado no mês corrente</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="type-metric text-foreground">{tooltipValor(comparacaoMensal.totalAtual)}</p>
              {comparacaoMensal.deltaPct !== null ? (
                // Variação de gasto não é boa nem ruim por si: fica em neutro.
                <span className="inline-flex items-center gap-0.5 text-sm font-medium tabular-nums text-text-secondary">
                  {comparacaoMensal.deltaPct >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" aria-label="alta" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" aria-label="queda" />
                  )}
                  {Math.abs(comparacaoMensal.deltaPct).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% vs. mês anterior
                </span>
              ) : (
                <span className="text-sm text-text-tertiary">Sem lançamentos no mês anterior para comparar</span>
              )}
            </div>
            <p className="mt-1 text-xs tabular-nums text-text-tertiary">
              {comparacaoMensal.countAtual} {comparacaoMensal.countAtual === 1 ? "pedido" : "pedidos"} este mês
              {comparacaoMensal.temMesAnterior && <> · {tooltipValor(comparacaoMensal.totalAnterior)} no mês anterior</>}
            </p>

            {evolucaoMensal.length > 1 && (
              <div className="mt-4 -ml-2">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={evolucaoMensal} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="label"
                      fontSize={11}
                      fontFamily="var(--font-mono)"
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--text-tertiary))"
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={((value: number, name: string) => [
                        tooltipValor(value),
                        name === "solicitado" ? "Solicitado" : name === "aprovado" ? "Aprovado" : "Pago",
                      ]) as any}
                      contentStyle={{
                        borderRadius: "6px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--popover))",
                        color: "hsl(var(--popover-foreground))",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="solicitado"
                      stroke="hsl(var(--text-tertiary))"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      dot={false}
                    />
                    <Line type="monotone" dataKey="aprovado" stroke="hsl(var(--text-secondary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="pago" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-1 flex items-center gap-4 pl-1 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-3 bg-text-tertiary inline-block" /> Solicitado
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-3 bg-text-secondary inline-block" /> Aprovado
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-3 bg-primary inline-block" /> Pago
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bloco 3: sequência do fluxo */}
        <Card>
          <div className="p-5">
            <p className="type-eyebrow mb-3 text-text-tertiary">Pedidos por etapa</p>
            <div className="space-y-2.5">
              <SequenciaLinha label="Aprovado" valor={sequenciaFluxo.aprovado} tone="neutral" />
              <SequenciaLinha label="Nota recebida" valor={sequenciaFluxo.notaRecebida} tone="neutral" />
              <SequenciaLinha label="Pago" valor={sequenciaFluxo.pago} tone="success" />
              <div className="mt-2 border-t border-border pt-2">
                <SequenciaLinha label="Recusado" valor={sequenciaFluxo.recusado} tone="danger" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Composição: o detalhamento de gastos (salário, HE, KM, plantão, condução,
          comissão) do conjunto filtrado — mesma régua fina do corte, sem virar
          card-por-tipo de novo. */}
      <Card>
        <div className="p-5">
          <p className="type-eyebrow mb-3 text-text-tertiary">Composição do período filtrado</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <ComposicaoItem label="Salário" valor={composicao.salario} formatValue={tooltipValor} />
            <ComposicaoItem label="Horas extras" valor={composicao.horasExtras} formatValue={tooltipValor} />
            <ComposicaoItem label="Reembolso de KM" valor={composicao.reembolsoKm} formatValue={tooltipValor} />
            <ComposicaoItem label="Plantão" valor={composicao.plantao} formatValue={tooltipValor} />
            <ComposicaoItem label="Condução" valor={composicao.conducao} formatValue={tooltipValor} />
            <ComposicaoItem label="Comissão" valor={composicao.comissao} formatValue={tooltipValor} />
          </div>
        </div>
      </Card>

      {/* Bloco 4: cortes — um card só, dividido por régua fina, não três caixas iguais */}
      <Card>
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <CorteColuna titulo="Maior volume por prestador" itens={cortes.prestadores} formatValue={tooltipValor} />
          <CorteColuna titulo="Por equipe" itens={cortes.equipes} formatValue={tooltipValor} />
          <CorteColuna titulo="Por centro de custo" itens={cortes.centrosCusto} formatValue={tooltipValor} />
        </div>
      </Card>
    </div>
  )
}

function ComposicaoItem({
  label,
  valor,
  formatValue,
}: {
  label: string
  valor: number
  formatValue: (v: number) => string
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-text-secondary">{label}</p>
      <p className="text-sm font-medium tabular-nums text-foreground">{formatValue(valor)}</p>
    </div>
  )
}

function SequenciaLinha({
  label,
  valor,
  tone,
}: {
  label: string
  valor: number
  tone: "neutral" | "success" | "danger"
}) {
  const cor = tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground"
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className={`font-medium tabular-nums ${cor}`}>{valor}</span>
    </div>
  )
}

function CorteColuna({
  titulo,
  itens,
  formatValue,
}: {
  titulo: string
  itens: Array<[string, number]>
  formatValue: (v: number) => string
}) {
  return (
    <div className="p-5">
      <p className="type-eyebrow mb-3 text-text-tertiary">{titulo}</p>
      {itens.length === 0 ? (
        <p className="text-sm text-text-tertiary">Nenhum pedido no período filtrado.</p>
      ) : (
        <div className="space-y-2">
          {itens.map(([nome, valor]) => (
            <div key={nome} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground truncate">{nome}</span>
              <span className="shrink-0 text-right font-medium tabular-nums">{formatValue(valor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
