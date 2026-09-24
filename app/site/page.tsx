import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteShell, SiteSection } from "@/components/site/site-shell"
import { DiagramaSimbolo } from "@/components/site/diagrama-simbolo"
import { AuditFields, AuditId, AuditTimestamp, AuditTrail } from "@/components/ui/audit"
import { StatusBadge } from "@/components/ui/status-badge"

export const metadata: Metadata = {
  title: "FluxoPay · um módulo Fluxteme",
  description:
    "O FluxoPay é o módulo da Fluxteme para pagamento de prestadores PJ: lançamento, aprovação em alçadas, nota fiscal e pagamento, com autor e horário registrados em cada etapa.",
}

const ETAPAS = [
  {
    n: "01",
    titulo: "Lançamento",
    texto:
      "Supervisor ou gerente lança o pedido do prestador: salário base, horas extras a 50% e 100%, plantão, condução, comissão, reembolso de quilometragem e descontos, cada um com o motivo.",
  },
  {
    n: "02",
    titulo: "Aprovação do gerente",
    texto: "O gerente da equipe aprova, recusa ou pede correção. A decisão fica registrada com autor, horário e observação.",
  },
  {
    n: "03",
    titulo: "Aprovação do financeiro",
    texto: "O financeiro aprova o pedido e informa a data prevista de pagamento, visível para o prestador e para quem lançou.",
  },
  {
    n: "04",
    titulo: "Nota fiscal",
    texto:
      "O prestador anexa o XML e o PDF da NFS-e dentro do prazo. Pedido de prorrogação é feito e decidido no próprio sistema.",
  },
  {
    n: "05",
    titulo: "Pagamento",
    texto: "O financeiro confere a nota, marca o pedido como pago e o ciclo se encerra com a trilha completa.",
  },
]

const COMPARACAO = [
  ["A nota que “parece certa”.", "A nota anexada ao pedido, com XML, número e valor conferidos pelo financeiro."],
  ["O pagamento aprovado porque alguém confiou em alguém.", "A aprovação com alçada, autor e horário, que não se reescreve."],
  ["O prestador que “sempre entregou”.", "Cada pedido do prestador, com a composição do valor e o motivo de cada item."],
  ["A planilha que só uma pessoa entende.", "Um fluxo único, com o que cada cargo pode ver e decidir."],
]

const CARGOS = [
  ["Colaborador", "Acompanha os próprios pedidos, anexa a nota fiscal e pede prorrogação de prazo."],
  ["Supervisor", "Lança pedidos para os colaboradores da sua equipe e acompanha as notas."],
  ["Gerente", "Aprova, recusa ou pede correção dos pedidos das equipes que gerencia."],
  ["Financeiro", "Aprova com data prevista, confere a nota fiscal e marca o pagamento."],
  ["Adm", "Cadastra pessoas, equipes e centros de custo da carteira."],
]

export default function SitePage() {
  return (
    <SiteShell>
      {/* Abertura */}
      <section className="bg-grid">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:px-8 lg:py-24">
          <div>
            <p className="type-eyebrow mb-6 text-primary">FluxoPay · um módulo Fluxteme</p>
            <h1 className="font-display text-5xl font-light leading-[1.05] tracking-[-0.01em] text-foreground sm:text-6xl lg:text-7xl">
              Pague prestadores PJ com o que se comprova.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              O FluxoPay organiza o pedido de pagamento de cada prestador de serviço, do lançamento à aprovação em alçadas, à nota
              fiscal e ao pagamento, com autor e horário registrados em cada etapa. Sua empresa passa a poder provar o que antes só
              afirmava.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Entrar no FluxoPay
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/fluxopay">Como o FluxoPay funciona</Link>
              </Button>
            </div>
          </div>
          <DiagramaSimbolo className="mx-auto w-full max-w-md" />
        </div>
      </section>

      {/* Contexto de mercado — dados com fonte */}
      <SiteSection
        eyebrow="Contexto"
        titulo="Para cada vaga CLT criada, surgem cerca de três novos MEIs."
        descricao="A contratação por pessoa jurídica deixou de ser tendência e virou a estrutura do mercado de trabalho. A mão de obra disponível já chega formalizada como empresa."
      >
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="space-y-8">
            {[
              { rotulo: "Saldo líquido de vagas CLT", valor: "1,27 mi", largura: "33%", tom: "bg-primary/45" },
              { rotulo: "MEIs abertos no ano", valor: "3,8 mi", largura: "100%", tom: "bg-primary" },
            ].map((b) => (
              <div key={b.rotulo}>
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <span className="text-sm text-text-secondary">{b.rotulo}</span>
                  <span className="font-display text-4xl font-light tabular-nums text-foreground">{b.valor}</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface">
                  <div className={`h-2.5 rounded-full ${b.tom}`} style={{ width: b.largura }} />
                </div>
              </div>
            ))}
          </div>
          <div className="border-l border-border pl-8">
            <p className="font-display text-7xl font-light tabular-nums leading-none text-foreground">13,1 mi</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              MEIs ativos no país. Serviços é o setor que mais cria postos, com 758 mil novas vagas formais em 2025.
            </p>
          </div>
        </div>
        <p className="type-audit mt-10 text-text-tertiary">
          Fontes: Novo CAGED/MTE (2025); Sebrae e Receita Federal/Portal do Empreendedor (2025). Saldo CLT é líquido; MEIs abertos
          é fluxo bruto do ano.
        </p>
      </SiteSection>

      {/* Doxa e episteme */}
      <SiteSection
        eyebrow="Por que registrar"
        titulo="De acreditar que está em ordem a poder provar."
        descricao="Quem contrata prestadores costuma operar por confiança: acredita que está em conformidade. O FluxoPay transforma cada etapa do pagamento em registro verificável."
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden grid-cols-2 border-b border-border bg-surface md:grid">
            <p className="type-eyebrow px-5 py-3 text-text-tertiary">Sem registro</p>
            <p className="type-eyebrow border-l border-border px-5 py-3 text-primary">Com o FluxoPay</p>
          </div>
          {COMPARACAO.map(([antes, depois]) => (
            <div key={antes} className="grid border-b border-border-subtle bg-card last:border-0 md:grid-cols-2">
              <p className="px-5 py-4 text-sm text-text-secondary">{antes}</p>
              <p className="border-border px-5 pb-4 text-sm text-foreground md:border-l md:py-4">{depois}</p>
            </div>
          ))}
        </div>
      </SiteSection>

      {/* Como funciona */}
      <SiteSection
        eyebrow="Como funciona"
        titulo="Um pedido, cinco etapas, nenhuma sem dono."
        descricao="Cada pedido percorre as mesmas etapas, e cada etapa tem um responsável definido pelo cargo."
      >
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-5">
          {ETAPAS.map((e) => (
            <li key={e.n} className="bg-card p-5">
              <p className="type-audit text-primary">{e.n}</p>
              <h3 className="mt-3 font-display text-lg font-normal text-foreground">{e.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{e.texto}</p>
            </li>
          ))}
        </ol>
        <Link href="/fluxopay" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          Ver o FluxoPay em detalhe
          <ArrowRight className="h-4 w-4" />
        </Link>
      </SiteSection>

      {/* O que fica registrado — componentes reais do produto */}
      <SiteSection
        eyebrow="Trilha de auditoria"
        titulo="O que fica registrado em cada pedido."
        descricao="Exemplo de um pedido no FluxoPay, na mesma tela que o financeiro e a auditoria consultam. Horário até o segundo, autor de cada decisão e a evidência fiscal anexada."
      >
        <div className="grid gap-8 rounded-lg border border-border bg-card p-6 lg:grid-cols-2 lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status="pendente_financeiro" />
              <span className="font-display text-3xl font-light tabular-nums text-foreground">R$ 6.360,00</span>
            </div>
            <AuditId valor="3f2a9c71-5b0e-4d8e-9a11-7c42e0f8d6b3" curto rotulo="identificador do pedido" className="text-text-tertiary" />
            <AuditFields
              itens={[
                { rotulo: "Prestador", valor: "Juliana Prado" },
                { rotulo: "Equipe", valor: "Operação Norte" },
                { rotulo: "Lançado em", valor: <AuditTimestamp valor="2026-09-22T17:04:11Z" /> },
                { rotulo: "Lançado por", valor: "Carlos Mendes · Supervisor" },
                { rotulo: "Salário base", valor: <span className="tabular-nums">R$ 5.200,00</span> },
                { rotulo: "Horas extras 50%", valor: <span className="tabular-nums">R$ 1.160,00</span> },
              ]}
            />
          </div>
          <AuditTrail
            eventos={[
              { id: "1", quando: "2026-09-22T17:04:11Z", acao: "Pedido lançado", autor: "Carlos Mendes · Supervisor" },
              {
                id: "2",
                quando: "2026-09-24T09:47:02Z",
                acao: "Aprovado pelo gerente",
                autor: "Paula Rezende",
                detalhe: "“Horas extras conferidas com o registro de ponto.”",
                tom: "sucesso",
              },
              { id: "5", quando: null, acao: "Aguardando decisão do financeiro", tom: "atual" },
            ]}
          />
        </div>
      </SiteSection>

      {/* Cargos */}
      <SiteSection
        eyebrow="Controle por cargo"
        titulo="Cada cargo vê só quem está abaixo dele."
        descricao="Dois supervisores ou dois gerentes não se enxergam, nem na mesma equipe. Quem aprova é sempre o cargo de cima, e ninguém aprova o próprio pedido."
      >
        <dl className="divide-y divide-border rounded-lg border border-border bg-card">
          {CARGOS.map(([cargo, faz]) => (
            <div key={cargo} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <dt className="type-eyebrow pt-0.5 text-foreground">{cargo}</dt>
              <dd className="text-sm text-text-secondary">{faz}</dd>
            </div>
          ))}
        </dl>
      </SiteSection>

      {/* Fechamento */}
      <section className="border-t border-border bg-grid">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="type-eyebrow mb-3 text-primary">FluxoPay · um módulo Fluxteme</p>
            <p className="max-w-xl font-display text-3xl font-light leading-tight text-foreground">
              Sua empresa já usa o FluxoPay? Entre com o e-mail cadastrado pelo administrador.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/login">
              Entrar no FluxoPay
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  )
}
