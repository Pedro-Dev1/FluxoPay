import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteShell, SiteSection } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "FluxoPay · módulo de pagamento de prestadores · Fluxteme",
  description:
    "Recursos do FluxoPay: lançamento de pedidos, aprovação em alçadas, nota fiscal com prazo, pagamento, gestão de pessoas e trilha de auditoria.",
}

// Tudo o que está listado aqui existe no produto hoje. Capacidade futura não
// entra nesta página (Manual de Marca, seção 10: episteme, não doxa).
const RECURSOS = [
  {
    grupo: "Lançamento",
    itens: [
      "Pedido completo ou só reembolso de quilometragem",
      "Salário base, horas extras a 50% e a 100%, plantão, condução e comissão",
      "Descontos por dias, por horas ou em valor fixo",
      "Motivo obrigatório para cada item lançado",
      "Uma condução por colaborador por mês, bloqueada no próprio lançamento",
      "Revisão do pedido completo antes do envio",
    ],
  },
  {
    grupo: "Aprovação",
    itens: [
      "Alçadas em sequência: gerente, depois financeiro",
      "Aprovar, recusar ou pedir correção, com observação registrada",
      "Correção volta para quem lançou e retorna à etapa que a pediu",
      "Data prevista de pagamento informada na aprovação do financeiro",
      "Aviso por e-mail e no sistema a quem precisa decidir",
    ],
  },
  {
    grupo: "Nota fiscal",
    itens: [
      "Prestador anexa XML e PDF da NFS-e ao pedido aprovado",
      "Prazo de anexo com contagem regressiva visível ao prestador",
      "Pedido e decisão de prorrogação de prazo dentro do sistema",
      "Conferência pelo financeiro, com recusa da nota e motivo",
    ],
  },
  {
    grupo: "Pagamento",
    itens: [
      "Marcação de pagamento pelo financeiro, pedido a pedido",
      "Fila de notas recebidas, de pedidos sem nota e de prorrogações",
      "Previsão de pagamento visível para prestador, supervisor e gerente",
    ],
  },
  {
    grupo: "Gestão de pessoas",
    itens: [
      "Cadastro de colaboradores, equipes, gerentes e centros de custo",
      "Reajuste salarial com histórico de cada alteração, autor e data",
      "Alerta de aniversário de contrato com 90 dias de antecedência",
      "Colaborador inativo deixa de compor a base ativa",
    ],
  },
  {
    grupo: "Governança",
    itens: [
      "Visibilidade por cargo: cada um vê só quem está abaixo dele",
      "Trilha de cada pedido com autor e horário até o segundo",
      "Aceite de termos com data, IP, dispositivo e hash do texto aceito",
      "Dashboard com valor do mês, pendências e tempo até aprovação",
      "Exportação em planilha do histórico filtrado",
    ],
  },
]

type Acesso = "sim" | "equipe" | "nao"
const CARGOS = ["Colaborador", "Supervisor", "Gerente", "Financeiro", "Adm"]
const PERMISSOES: [string, Acesso[]][] = [
  ["Lançar pedido de pagamento", ["nao", "equipe", "equipe", "sim", "sim"]],
  ["Decidir como gerente", ["nao", "nao", "equipe", "nao", "sim"]],
  ["Decidir como financeiro", ["nao", "nao", "nao", "sim", "sim"]],
  ["Anexar nota fiscal do próprio pedido", ["sim", "sim", "sim", "sim", "nao"]],
  ["Marcar pedido como pago", ["nao", "nao", "nao", "sim", "sim"]],
  ["Consultar histórico de pedidos", ["nao", "equipe", "equipe", "sim", "sim"]],
  ["Cadastrar pessoas, equipes e centros de custo", ["nao", "nao", "nao", "sim", "sim"]],
]

function Celula({ acesso }: { acesso: Acesso }) {
  if (acesso === "nao") return <Minus className="mx-auto h-4 w-4 text-border-strong" aria-label="Não" />
  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <Check className="h-4 w-4 text-primary" aria-label="Sim" />
      {acesso === "equipe" && <span className="type-audit text-[10px] text-text-tertiary">equipe</span>}
    </span>
  )
}

export default function FluxoPayPage() {
  return (
    <SiteShell ativo="/fluxopay">
      <section className="bg-grid">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="type-eyebrow mb-5 text-primary">Módulo Fluxteme</p>
          <h1 className="max-w-4xl font-display text-5xl font-light leading-[1.05] text-foreground sm:text-6xl">FluxoPay</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
            O módulo da Fluxteme para o pagamento de prestadores PJ e MEI. Da solicitação ao pagamento, cada valor tem motivo,
            cada decisão tem autor e cada etapa tem horário.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Entrar no FluxoPay
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/seguranca">Segurança e governança</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteSection
        eyebrow="Recursos"
        titulo="O que o FluxoPay faz hoje."
        descricao="Lista do que está disponível no módulo. Capacidades em desenvolvimento não entram aqui."
      >
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r) => (
            <div key={r.grupo} className="bg-card p-6">
              <h3 className="font-display text-xl font-normal text-foreground">{r.grupo}</h3>
              <ul className="mt-4 space-y-2.5">
                {r.itens.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-text-secondary">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SiteSection>

      <SiteSection
        eyebrow="Permissões"
        titulo="Quem pode fazer o quê."
        descricao="As permissões valem no servidor, não só na tela. “Equipe” indica que a ação vale apenas para quem está abaixo na hierarquia das equipes da pessoa."
      >
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface">
              <tr className="border-b border-border">
                <th className="type-eyebrow px-5 py-3 text-left text-text-tertiary">Ação</th>
                {CARGOS.map((c) => (
                  <th key={c} className="type-eyebrow px-3 py-3 text-center text-text-tertiary">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSOES.map(([acao, acessos]) => (
                <tr key={acao} className="border-b border-border-subtle last:border-0">
                  <td className="px-5 py-3 text-foreground">{acao}</td>
                  {acessos.map((a, i) => (
                    <td key={i} className="px-3 py-3 text-center">
                      <Celula acesso={a} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SiteSection>

      <SiteSection eyebrow="Limites" titulo="O que o FluxoPay não faz.">
        <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {[
            [
              "Não movimenta dinheiro",
              "O FluxoPay registra e controla o pagamento. A transferência continua sendo feita pela sua empresa, pelo banco dela.",
            ],
            [
              "Não é instituição financeira",
              "Não guarda saldo, não emite cobrança ao prestador e não intermedeia pagamento.",
            ],
            [
              "Não substitui avaliação jurídica",
              "A trilha documenta a relação com o prestador; a análise de risco de vínculo continua sendo papel do seu jurídico.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="bg-card p-6">
              <dt className="font-display text-lg font-normal text-foreground">{t}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-text-secondary">{d}</dd>
            </div>
          ))}
        </dl>
      </SiteSection>
    </SiteShell>
  )
}
