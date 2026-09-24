import { notFound } from "next/navigation"
import { AlertCircle, CheckCircle2, Download, FileText, Inbox, Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Section } from "@/components/ui/section"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StatusBadge, StatusIndicator, STATUS_SISTEMA } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { TableSkeleton, MetricsSkeleton } from "@/components/ui/loading-states"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AuditFields, AuditHash, AuditId, AuditTimestamp, AuditTrail } from "@/components/ui/audit"
import { BrandLogo } from "@/components/brand-logo"

// Referência viva do DESIGN_SYSTEM.md, só em desenvolvimento. Em produção,
// 404 — os componentes reais estão nas telas do produto.
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound()

  const linhas = [
    { nome: "Ana Beatriz Figueiredo de Albuquerque Nogueira", equipe: "Operação Norte", status: "aprovado", valor: 1234567.89, quando: "2026-09-22T17:04:11Z" },
    { nome: "Carlos Mendes", equipe: "Manutenção", status: "pendente_gerente", valor: 4820.5, quando: "2026-09-23T12:30:00Z" },
    { nome: "Juliana Prado", equipe: "Operação Sul", status: "correcao", valor: 312.0, quando: "2026-09-24T09:15:42Z" },
    { nome: "Rafael Tavares", equipe: "Manutenção", status: "recusado", valor: 12900.0, quando: "2026-09-20T15:00:00Z" },
    { nome: "Marina Lopes", equipe: "Operação Norte", status: "pago", valor: 7650.25, quando: "2026-09-18T19:47:03Z" },
  ]
  const moeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 lg:px-8">
      <PageHeader
        eyebrow="Sistema"
        title="Design System"
        description="Referência dos componentes do Fluxteme. Fonte: docs/DESIGN_SYSTEM.md."
        meta={<span className="type-audit">Manual de Marca v2.0 · tokens em app/globals.css</span>}
        action={
          <>
            <Button variant="outline">
              <Download />
              Exportar planilha
            </Button>
            <Button>
              <Plus />
              Criar pedido
            </Button>
          </>
        }
      />

      <Section title="Marca" description="Versão escolhida pela luminância do fundo.">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          <div className="flex h-28 items-center justify-center gap-8 bg-card">
            <BrandLogo fundo="claro" className="h-6" />
            <BrandLogo forma="icone" fundo="claro" />
          </div>
          <div className="flex h-28 items-center justify-center gap-8 bg-brand-navy">
            <BrandLogo fundo="escuro" className="h-6" />
            <BrandLogo forma="icone" fundo="escuro" />
          </div>
        </div>
      </Section>

      <Section title="Tipografia">
        <div className="space-y-3">
          <p className="type-eyebrow text-primary">Eyebrow · JetBrains Mono 500</p>
          <p className="type-title">Título de página · Jost 300</p>
          <p className="type-subtitle">Subtítulo · Jost 400</p>
          <p className="type-intertitle">Intertítulo de seção · Jost 500</p>
          <p className="text-sm text-text-secondary">Corpo · Inter 400. A empresa passa a poder provar o que antes apenas afirmava.</p>
          <p className="type-metric">R$ 1.234.567,89</p>
          <p className="type-audit break-all">9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08</p>
        </div>
      </Section>

      <Section title="Indicadores" description="Uma métrica primária e até três de apoio, na mesma faixa.">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="bg-card p-5">
            <p className="type-eyebrow text-text-tertiary">Valor lançado no mês corrente</p>
            <p className="type-metric mt-2">R$ 1.234.567,89</p>
            <p className="mt-1 text-xs tabular-nums text-text-tertiary">148 pedidos · R$ 1.102.340,10 no mês anterior</p>
          </div>
          {[
            ["Pedidos", "148", "text-foreground"],
            ["Aprovados", "96", "text-success"],
            ["Aguardando decisão", "12", "text-warning"],
          ].map(([r, v, t]) => (
            <div key={r} className="bg-card p-5">
              <p className="type-eyebrow text-text-tertiary">{r}</p>
              <p className={`mt-2 font-display text-2xl font-light tabular-nums ${t}`}>{v}</p>
            </div>
          ))}
        </div>
        <MetricsSkeleton />
      </Section>

      <Section title="Botões">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Aprovar pagamento</Button>
          <Button variant="outline">Pedir correção</Button>
          <Button variant="ghost">Limpar filtros</Button>
          <Button variant="destructive">Recusar pedido</Button>
          <Button loading>Registrando</Button>
          <Button disabled>Indisponível</Button>
          <Button size="sm" variant="outline">
            Pequeno
          </Button>
          <Button size="icon" variant="ghost" aria-label="Baixar nota fiscal">
            <Download />
          </Button>
          <Button variant="link">Ver trilha completa</Button>
        </div>
      </Section>

      <Section title="Status e badges" description="Ícone + texto + cor.">
        <div className="flex flex-wrap gap-2">
          {["pendente_gerente", "pendente_financeiro", "aprovado", "nota_recebida", "pago", "correcao", "aguardando_prorrogacao", "recusado", "expirado"].map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_SISTEMA) as (keyof typeof STATUS_SISTEMA)[]).map((s) => (
            <StatusIndicator key={s} status={s} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Destaque</Badge>
          <Badge variant="secondary">Neutro</Badge>
          <Badge variant="success">Sucesso</Badge>
          <Badge variant="warning">Atenção</Badge>
          <Badge variant="destructive">Erro</Badge>
          <Badge variant="outline">Contorno</Badge>
        </div>
      </Section>

      <Section title="Formulário">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ds-nome">Nome completo</Label>
            <Input id="ds-nome" placeholder="Ex.: Ana Beatriz Figueiredo" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-valor">Valor</Label>
            <Input id="ds-valor" defaultValue="R$ 4.820,50" className="tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-erro">Data prevista de pagamento</Label>
            <Input id="ds-erro" aria-invalid="true" defaultValue="31/02/2026" />
            <p className="text-xs text-danger">Informe uma data válida.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-off">CNPJ</Label>
            <Input id="ds-off" disabled defaultValue="69.046.679/0001-56" />
            <p className="text-xs text-text-tertiary">Definido no cadastro; não editável aqui.</p>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ds-obs">Observação</Label>
            <Textarea id="ds-obs" placeholder="Fica registrada no pedido e é vista por quem lançou." />
          </div>
        </div>
      </Section>

      <Section title="Avisos">
        <div className="grid gap-3 lg:grid-cols-2">
          <Alert>
            <FileText />
            <AlertTitle>Nova versão dos termos comerciais</AlertTitle>
            <AlertDescription>Publicada em 24/09/2026. Adm e Financeiro precisam aceitar para continuar.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertCircle />
            <AlertTitle>Correção pedida pelo gerente</AlertTitle>
            <AlertDescription>Ajuste o pedido conforme a observação registrada e reenvie.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Prazo da nota fiscal vencido</AlertTitle>
            <AlertDescription>O pedido expirou em 20/09/2026. Solicite prorrogação ao financeiro.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <CheckCircle2 />
            <AlertTitle>Pagamento registrado</AlertTitle>
            <AlertDescription>Marcado como pago em 24/09/2026 por Marina Lopes.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section title="Tabela" description="Densa, números à direita com algarismos tabulares, nome longo truncado.">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead className="hidden md:table-cell">Equipe</TableHead>
                <TableHead>Lançado em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l) => (
                <TableRow key={l.nome} tabIndex={0} className="cursor-pointer">
                  <TableCell className="max-w-[16rem] truncate font-medium" title={l.nome}>
                    {l.nome}
                  </TableCell>
                  <TableCell className="hidden text-text-secondary md:table-cell">{l.equipe}</TableCell>
                  <TableCell>
                    <AuditTimestamp valor={l.quando} className="text-text-secondary" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={l.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">{moeda(l.valor)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="py-2 type-eyebrow text-text-tertiary">
                  Total do filtro
                </TableCell>
                <TableCell className="whitespace-nowrap py-2 text-right font-semibold tabular-nums">
                  {moeda(linhas.reduce((s, l) => s + l.valor, 0))}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Section>

      <Section title="Auditoria">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <AuditId valor="3f2a9c71-5b0e-4d8e-9a11-7c42e0f8d6b3" curto rotulo="identificador do pedido" />
            <AuditHash valor="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" />
            <AuditFields
              itens={[
                { rotulo: "Lançado em", valor: <AuditTimestamp valor="2026-09-22T17:04:11Z" /> },
                { rotulo: "Lançado por", valor: "Carlos Mendes · Supervisor" },
                { rotulo: "NFS-e", valor: <AuditId valor="2026000001847" rotulo="número da NFS-e" /> },
                { rotulo: "Valor do serviço", valor: <span className="tabular-nums">R$ 4.820,50</span> },
              ]}
            />
          </div>
          <AuditTrail
            eventos={[
              { id: "1", quando: "2026-09-22T17:04:11Z", acao: "Pedido lançado", autor: "Carlos Mendes · Supervisor" },
              { id: "2", quando: "2026-09-23T12:30:09Z", acao: "Aprovado pelo gerente", autor: "Paula Rezende", tom: "sucesso" },
              { id: "3", quando: "2026-09-23T18:02:44Z", acao: "Correção pedida pelo financeiro", autor: "Marina Lopes", detalhe: "“Horas extras sem registro de ponto anexado.”", tom: "atencao" },
              { id: "4", quando: null, acao: "Aguardando decisão do financeiro", tom: "atual" },
            ]}
          />
        </div>
      </Section>

      <Section title="Estados">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card">
            <EmptyState
              icon={Inbox}
              title="Nenhum pedido aguardando sua decisão"
              description="Quando um pedido da sua alçada for lançado, ele aparece aqui com o valor e a composição."
              action={<Button variant="outline">Ver histórico de pedidos</Button>}
            />
          </div>
          <ErrorState referencia="4193822077" action={<Button>Carregar de novo</Button>} />
        </div>
        <TableSkeleton rows={4} />
      </Section>
    </div>
  )
}
