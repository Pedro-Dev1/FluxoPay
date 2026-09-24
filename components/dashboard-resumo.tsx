"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { PedidoPagamento } from "@/types/pedido"
import { useMaskedCurrency } from "@/components/currency-display"
import { cn } from "@/lib/utils"

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
const DIA_MS = 86400000

const diasAtras = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DIA_MS))
const colaboradorDe = (p: PedidoPagamento) => (p.colaborador || p.colaboradores) as any
const APROVADOS = ["aprovado", "nota_recebida", "pago"]

/** Abreviação só no eixo do gráfico; tabela e detalhe usam precisão total. */
function abreviarEixo(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`
  if (v >= 1_000) return `${Math.round(v / 1_000)} mil`
  return String(v)
}

function variacao(atual: number, anterior: number | null) {
  if (anterior === null || anterior === 0) return null
  return ((atual - anterior) / anterior) * 100
}

// DESIGN_SYSTEM.md §31. Ordem: exige ação → indicadores com comparação →
// evolução e fluxo → onde o valor se concentra.
export function DashboardResumo({ pedidos, tipoAcesso, acaoAgoraItens, acaoAgoraMaisAntigo }: DashboardResumoProps) {
  const { formatValue, valoresVisiveis } = useMaskedCurrency()
  const moeda = (v: number) => (valoresVisiveis ? formatValue(v) : "R$ ------")

  const totalAcaoAgora = acaoAgoraItens.reduce((s, i) => s + i.count, 0)

  const indicadores = useMemo(() => {
    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const inicioAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
    const limite30 = Date.now() - 30 * DIA_MS
    const limite60 = Date.now() - 60 * DIA_MS

    let valorMes = 0
    let qtdMes = 0
    let valorAnterior = 0
    let qtdAnterior = 0
    let temAnterior = false
    let pendentesQtd = 0
    let pendentesValor = 0
    let pendenteMaisAntigo: string | null = null
    const tempos30: number[] = []
    const tempos60: number[] = []

    for (const p of pedidos) {
      const criado = new Date(p.created_at)
      if (criado >= inicioMes) {
        valorMes += p.valor_total
        qtdMes += 1
      } else if (criado >= inicioAnterior) {
        valorAnterior += p.valor_total
        qtdAnterior += 1
        temAnterior = true
      }
      if (p.status === "pendente_gerente" || p.status === "pendente_financeiro") {
        pendentesQtd += 1
        pendentesValor += p.valor_total
        if (!pendenteMaisAntigo || p.created_at < pendenteMaisAntigo) pendenteMaisAntigo = p.created_at
      }
      if (p.data_aprovacao_gerente && p.aprovado_gerente) {
        const quando = new Date(p.data_aprovacao_gerente).getTime()
        const dias = (quando - criado.getTime()) / DIA_MS
        if (dias >= 0) {
          if (quando >= limite30) tempos30.push(dias)
          else if (quando >= limite60) tempos60.push(dias)
        }
      }
    }

    const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
    return {
      valorMes,
      qtdMes,
      valorAnterior: temAnterior ? valorAnterior : null,
      qtdAnterior: temAnterior ? qtdAnterior : null,
      pendentesQtd,
      pendentesValor,
      pendenteMaisAntigo,
      tempoAprovacao: media(tempos30),
      tempoAprovacaoAnterior: media(tempos60),
      amostraTempo: tempos30.length,
    }
  }, [pedidos])

  // Últimos 6 meses (incluindo o corrente), sempre completos no eixo.
  const evolucao = useMemo(() => {
    const agora = new Date()
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(agora.getFullYear(), agora.getMonth() - 5 + i, 1)
      return {
        chave: `${d.getFullYear()}-${d.getMonth()}`,
        rotulo: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
        lancado: 0,
        aprovado: 0,
        pago: 0,
      }
    })
    const porChave = new Map(meses.map((m) => [m.chave, m]))
    for (const p of pedidos) {
      const d = new Date(p.created_at)
      const m = porChave.get(`${d.getFullYear()}-${d.getMonth()}`)
      if (!m) continue
      m.lancado += p.valor_total
      if (APROVADOS.includes(p.status)) m.aprovado += p.valor_total
      if (p.status === "pago") m.pago += p.valor_total
    }
    return meses
  }, [pedidos])

  const fluxo = useMemo(() => {
    const etapas = [
      { id: "pendente_gerente", rotulo: "Aguardando gerente", tom: "bg-primary/60" },
      { id: "pendente_financeiro", rotulo: "Aguardando financeiro", tom: "bg-primary/60" },
      { id: "correcao", rotulo: "Em correção", tom: "bg-warning" },
      { id: "aprovado", rotulo: "Aguardando nota fiscal", tom: "bg-primary/60" },
      { id: "nota_recebida", rotulo: "Nota recebida", tom: "bg-primary/60" },
      { id: "pago", rotulo: "Pago", tom: "bg-success" },
    ].map((e) => ({ ...e, qtd: 0, valor: 0 }))
    const encerrados = { qtd: 0, valor: 0 }
    for (const p of pedidos) {
      const e = etapas.find((x) => x.id === p.status)
      if (e) {
        e.qtd += 1
        e.valor += p.valor_total
      } else if (["recusado", "expirado", "prorrogacao_negada"].includes(p.status)) {
        encerrados.qtd += 1
        encerrados.valor += p.valor_total
      }
    }
    const max = Math.max(1, ...etapas.map((e) => e.qtd))
    return { etapas, encerrados, max }
  }, [pedidos])

  const concentracao = useMemo(() => {
    const somar = (chave: (p: PedidoPagamento) => string) => {
      const m = new Map<string, number>()
      for (const p of pedidos) m.set(chave(p), (m.get(chave(p)) || 0) + p.valor_total)
      return Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    }
    let salario = 0
    let horasExtras = 0
    let km = 0
    let plantao = 0
    let conducao = 0
    let comissao = 0
    for (const p of pedidos) {
      if (p.tipo_pedido === "reembolso_km") {
        km += p.valor_km || 0
        continue
      }
      salario += p.salario_base ?? colaboradorDe(p)?.salario ?? 0
      horasExtras += p.horas_extras || 0
      km += p.valor_km || 0
      plantao += p.valor_plantao || 0
      conducao += p.conducao || 0
      comissao += p.comissao || 0
    }
    const composicao = (
      [
        ["Salário", salario],
        ["Horas extras", horasExtras],
        ["Comissão", comissao],
        ["Reembolso de KM", km],
        ["Plantão", plantao],
        ["Condução", conducao],
      ] as [string, number][]
    ).sort((a, b) => b[1] - a[1])
    return {
      composicao,
      prestadores: somar((p) => colaboradorDe(p)?.nome_completo || "Não identificado"),
      equipes: somar((p) => colaboradorDe(p)?.equipe?.nome || "Sem equipe"),
      centros: somar((p) => {
        const cc = colaboradorDe(p)?.centro_custo
        return cc ? `${cc.numero} · ${cc.nome}` : "Sem centro de custo"
      }),
    }
  }, [pedidos])

  const deltaValor = variacao(indicadores.valorMes, indicadores.valorAnterior)
  const acaoAgoraLabel = tipoAcesso === "Gerente" || tipoAcesso === "Supervisor" ? "aguardando você" : "no seu radar hoje"

  return (
    <div className="space-y-6">
      {totalAcaoAgora > 0 && (
        <section
          aria-label="Exige ação"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border border-l-2 border-l-warning bg-card px-4 py-3"
        >
          <p className="text-sm text-foreground">
            <span className="font-medium tabular-nums">{totalAcaoAgora}</span> {totalAcaoAgora === 1 ? "pedido" : "pedidos"}{" "}
            {acaoAgoraLabel}
            {acaoAgoraMaisAntigo && (
              <span className="text-text-secondary">
                {" "}
                · mais antigo de {acaoAgoraMaisAntigo.nome}, há{" "}
                <span className="tabular-nums">{diasAtras(acaoAgoraMaisAntigo.createdAt)}</span>{" "}
                {diasAtras(acaoAgoraMaisAntigo.createdAt) === 1 ? "dia" : "dias"}
              </span>
            )}
          </p>
          <div className="ml-auto flex flex-wrap gap-2">
            {acaoAgoraItens
              .filter((i) => i.count > 0)
              .map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex h-8 items-center gap-2 rounded-control bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  <span className="tabular-nums">{item.count}</span> {item.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Indicadores: um primário e três de apoio, todos com comparação */}
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <Indicador rotulo="Valor lançado no mês" destaque>
          <p className="type-metric text-foreground">{moeda(indicadores.valorMes)}</p>
          <Comparacao
            delta={deltaValor}
            texto={
              indicadores.valorAnterior !== null ? `${moeda(indicadores.valorAnterior)} no mês anterior` : "Sem lançamentos no mês anterior"
            }
          />
        </Indicador>
        <Indicador rotulo="Pedidos no mês">
          <p className="font-display text-3xl font-light tabular-nums text-foreground">{indicadores.qtdMes}</p>
          <Comparacao
            delta={variacao(indicadores.qtdMes, indicadores.qtdAnterior)}
            texto={indicadores.qtdAnterior !== null ? `${indicadores.qtdAnterior} no mês anterior` : "Sem mês anterior"}
          />
        </Indicador>
        <Indicador rotulo="Aguardando decisão">
          <p
            className={cn(
              "font-display text-3xl font-light tabular-nums",
              indicadores.pendentesQtd > 0 ? "text-warning" : "text-foreground",
            )}
          >
            {indicadores.pendentesQtd}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {indicadores.pendentesQtd > 0 ? (
              <>
                <span className="tabular-nums">{moeda(indicadores.pendentesValor)}</span> · mais antigo há{" "}
                <span className="tabular-nums">{diasAtras(indicadores.pendenteMaisAntigo!)}</span>{" "}
                {diasAtras(indicadores.pendenteMaisAntigo!) === 1 ? "dia" : "dias"}
              </>
            ) : (
              "Nenhum pedido parado em aprovação"
            )}
          </p>
        </Indicador>
        <Indicador rotulo="Tempo até aprovação">
          <p className="font-display text-3xl font-light tabular-nums text-foreground">
            {indicadores.tempoAprovacao !== null
              ? `${indicadores.tempoAprovacao.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} dias`
              : "—"}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {indicadores.tempoAprovacao !== null ? (
              <>
                média de {indicadores.amostraTempo} {indicadores.amostraTempo === 1 ? "aprovação" : "aprovações"} do gerente em 30 dias
                {indicadores.tempoAprovacaoAnterior !== null && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="tabular-nums">
                      {indicadores.tempoAprovacaoAnterior.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                    </span>{" "}
                    nos 30 anteriores
                  </>
                )}
              </>
            ) : (
              "Sem aprovações nos últimos 30 dias"
            )}
          </p>
        </Indicador>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-border bg-card p-5 lg:col-span-2" aria-label="Evolução mensal">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="type-intertitle text-foreground">Lançado e aprovado por mês</h2>
              <p className="text-xs text-text-tertiary">Últimos 6 meses, pela data de lançamento</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] bg-border-strong" aria-hidden="true" /> Lançado
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] bg-primary" aria-hidden="true" /> Aprovado
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolucao} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={3} barCategoryGap="26%">
                <CartesianGrid vertical={false} stroke="hsl(var(--border-subtle))" />
                <XAxis
                  dataKey="rotulo"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "hsl(var(--text-tertiary))" }}
                  dy={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tickFormatter={(v: number) => (valoresVisiveis ? abreviarEixo(v) : "")}
                  tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "hsl(var(--text-tertiary))" }}
                />
                <Tooltip cursor={{ fill: "hsl(var(--surface))" }} content={<DicaMensal moeda={moeda} />} />
                <Bar dataKey="lancado" fill="hsl(var(--border-strong))" radius={[2, 2, 0, 0]} maxBarSize={28} />
                <Bar dataKey="aprovado" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5" aria-label="Pedidos por etapa">
          <h2 className="type-intertitle text-foreground">Pedidos por etapa</h2>
          <p className="mb-4 text-xs text-text-tertiary">Onde cada pedido está agora</p>
          <ul className="space-y-3">
            {fluxo.etapas.map((e) => (
              <li key={e.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-text-secondary">{e.rotulo}</span>
                  <span className="tabular-nums">
                    <span className="font-medium text-foreground">{e.qtd}</span>
                    <span className="ml-2 text-xs text-text-tertiary">{moeda(e.valor)}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-surface">
                  <div className={cn("h-1 rounded-full", e.tom)} style={{ width: `${(e.qtd / fluxo.max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-baseline justify-between border-t border-border pt-3 text-sm">
            <span className="text-text-secondary">Recusados ou expirados</span>
            <span className="tabular-nums">
              <span className={cn("font-medium", fluxo.encerrados.qtd > 0 ? "text-danger" : "text-foreground")}>
                {fluxo.encerrados.qtd}
              </span>
              <span className="ml-2 text-xs text-text-tertiary">{moeda(fluxo.encerrados.valor)}</span>
            </span>
          </p>
        </section>
      </div>

      <section aria-label="Onde o valor se concentra" className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="type-intertitle text-foreground">Onde o valor se concentra</h2>
          <p className="text-xs text-text-tertiary">No período filtrado · maiores valores primeiro</p>
        </div>
        <div className="grid divide-y divide-border md:grid-cols-2 md:divide-y-0 xl:grid-cols-4 xl:divide-x">
          <Ranking titulo="Composição" itens={concentracao.composicao} moeda={moeda} />
          <Ranking titulo="Prestadores" itens={concentracao.prestadores} moeda={moeda} />
          <Ranking titulo="Equipes" itens={concentracao.equipes} moeda={moeda} />
          <Ranking titulo="Centros de custo" itens={concentracao.centros} moeda={moeda} />
        </div>
      </section>
    </div>
  )
}

function Indicador({ rotulo, destaque, children }: { rotulo: string; destaque?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("bg-card p-5", destaque && "sm:col-span-2 xl:col-span-1")}>
      <p className="type-eyebrow mb-2 text-text-tertiary">{rotulo}</p>
      {children}
    </div>
  )
}

function Comparacao({ delta, texto }: { delta: number | null; texto: string }) {
  // Variação de volume não é boa nem ruim por si: neutra, com seta e sinal.
  const estavel = delta !== null && Math.abs(delta) < 0.05
  const Icone = delta === null ? null : estavel ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-text-tertiary">
      {estavel && <span className="font-medium text-text-secondary">Sem variação ·</span>}
      {Icone && delta !== null && !estavel && (
        <span className="inline-flex items-center font-medium tabular-nums text-text-secondary">
          <Icone className="h-3.5 w-3.5" aria-hidden="true" />
          {delta > 0 ? "+" : ""}
          {delta.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
        </span>
      )}
      <span>{texto}</span>
    </p>
  )
}

function Ranking({ titulo, itens, moeda }: { titulo: string; itens: [string, number][]; moeda: (v: number) => string }) {
  const visiveis = itens.filter(([, v]) => v > 0)
  const max = Math.max(1, ...visiveis.map(([, v]) => v))
  return (
    <div className="p-5">
      <p className="type-eyebrow mb-3 text-text-tertiary">{titulo}</p>
      {visiveis.length === 0 ? (
        <p className="text-sm text-text-tertiary">Nenhum valor no período filtrado.</p>
      ) : (
        <ol className="space-y-2.5">
          {visiveis.map(([nome, valor]) => (
            <li key={nome}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-foreground" title={nome}>
                  {nome}
                </span>
                <span className="shrink-0 tabular-nums text-text-secondary">{moeda(valor)}</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-surface" aria-hidden="true">
                <div className="h-1 rounded-full bg-primary/50" style={{ width: `${(valor / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function DicaMensal({
  active,
  payload,
  label,
  moeda,
}: {
  active?: boolean
  payload?: Array<{ payload: unknown }>
  label?: string | number
  moeda: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as { lancado: number; aprovado: number; pago: number }
  const taxa = d.lancado > 0 ? (d.aprovado / d.lancado) * 100 : null
  return (
    <div className="min-w-[200px] rounded-lg border border-border bg-popover p-3 text-xs shadow-float">
      <p className="type-eyebrow mb-2 text-text-tertiary">{label}</p>
      <dl className="space-y-1">
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Lançado</dt>
          <dd className="tabular-nums text-foreground">{moeda(d.lancado)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Aprovado</dt>
          <dd className="tabular-nums text-foreground">{moeda(d.aprovado)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Pago</dt>
          <dd className="tabular-nums text-foreground">{moeda(d.pago)}</dd>
        </div>
      </dl>
      {taxa !== null && (
        <p className="mt-2 border-t border-border pt-2 text-text-tertiary">
          <span className="tabular-nums text-foreground">{taxa.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%</span> do
          lançado foi aprovado
        </p>
      )}
    </div>
  )
}
