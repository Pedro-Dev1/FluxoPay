import type { Metadata } from "next"
import Link from "next/link"
import { SiteShell, SiteSection } from "@/components/site/site-shell"
import { AuditHash, AuditTimestamp } from "@/components/ui/audit"

export const metadata: Metadata = {
  title: "Segurança e governança · FluxoPay · Fluxteme",
  description:
    "Como o FluxoPay protege acesso e dados: visibilidade por cargo validada no servidor, isolamento por carteira, sessão assinada, trilha de auditoria e aceite de termos com hash.",
}

// Só medidas que existem no código hoje, descritas com o número real
// (tempo de sessão, validade de link, algoritmo). Sem selo ou certificação
// que a empresa não tenha.
const CONTROLES = [
  {
    titulo: "Visibilidade por cargo",
    texto:
      "Cada pessoa vê apenas quem está abaixo dela nas equipes que lidera. Dois cargos iguais não se enxergam, e ninguém decide sobre o próprio pedido. A regra é aplicada no servidor, em cada consulta.",
  },
  {
    titulo: "Isolamento por carteira",
    texto:
      "Os dados de cada empresa cliente ficam em uma carteira separada. Toda consulta é filtrada pela carteira de quem está logado.",
  },
  {
    titulo: "Sessão assinada",
    texto:
      "A sessão é um cookie HttpOnly assinado com HMAC-SHA256, válido por até 7 dias, e encerrada após 4 minutos sem atividade na tela.",
  },
  {
    titulo: "Senhas",
    texto:
      "Senhas são guardadas apenas como hash bcrypt. O link de redefinição expira em 1 hora e só funciona uma vez.",
  },
  {
    titulo: "Trilha de auditoria",
    texto:
      "Cada etapa do pedido registra autor e horário. Ações privilegiadas da plataforma, como criar carteira ou publicar termos, ficam em um registro próprio.",
  },
  {
    titulo: "Aceite de termos com prova",
    texto:
      "O aceite registra data, IP, dispositivo e o hash SHA-256 do texto exato aceito. Cada resposta é uma nova linha — nada é sobrescrito.",
  },
]

export default function SegurancaPage() {
  return (
    <SiteShell ativo="/seguranca">
      <section className="bg-grid">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="type-eyebrow mb-5 text-primary">Segurança e governança</p>
          <h1 className="max-w-4xl font-display text-5xl font-light leading-[1.05] text-foreground sm:text-6xl">
            Controle que se verifica, não que se promete.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
            As medidas abaixo são as que o FluxoPay aplica hoje, com os números reais de cada uma.
          </p>
        </div>
      </section>

      <SiteSection eyebrow="Controles" titulo="Como o acesso e os dados são protegidos.">
        <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {CONTROLES.map((c) => (
            <div key={c.titulo} className="bg-card p-6">
              <dt className="font-display text-xl font-normal text-foreground">{c.titulo}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-text-secondary">{c.texto}</dd>
            </div>
          ))}
        </dl>
      </SiteSection>

      <SiteSection
        eyebrow="Evidência"
        titulo="Como um aceite fica registrado."
        descricao="Exemplo do que a Fluxteme consegue apresentar sobre um aceite de termos, sem depender da memória de ninguém."
      >
        <div className="max-w-2xl divide-y divide-border rounded-lg border border-border bg-card">
          {[
            ["Pessoa", <span key="p">Marina Lopes · Financeiro</span>],
            ["Documento", <span key="d">Termos comerciais · versão 1.0</span>],
            ["Aceito em", <AuditTimestamp key="t" valor="2026-09-24T12:31:07Z" />],
            ["Origem", <span key="o" className="type-audit">IP 189.34.xxx.xxx · Windows · Chrome</span>],
            ["Texto aceito", <AuditHash key="h" valor="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" />],
          ].map(([rotulo, valor]) => (
            <div key={rotulo as string} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <p className="type-eyebrow pt-0.5 text-text-tertiary">{rotulo}</p>
              <div className="min-w-0 text-sm text-foreground">{valor}</div>
            </div>
          ))}
        </div>
      </SiteSection>

      <SiteSection eyebrow="LGPD" titulo="Dados pessoais.">
        <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-text-secondary">
          <p>
            Para os dados de prestadores inseridos pela empresa cliente, a empresa cliente é a controladora e a Fluxteme atua como
            operadora, conforme o art. 37 da LGPD. O detalhamento de bases legais, prazos de retenção e direitos do titular está na{" "}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de privacidade
            </Link>
            .
          </p>
          <p>
            Pedidos de titulares e comunicação de incidentes:{" "}
            <a href="mailto:contato@fluxteme.com.br" className="text-primary hover:underline">
              contato@fluxteme.com.br
            </a>
            .
          </p>
        </div>
      </SiteSection>
    </SiteShell>
  )
}
