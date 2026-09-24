import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteShell, SiteSection } from "@/components/site/site-shell"
import { StatusIndicator } from "@/components/ui/status-badge"

export const metadata: Metadata = {
  title: "Empresa · Fluxteme",
  description:
    "A Fluxteme é uma plataforma de governança e compliance para contratação de prestadores PJ. O nome vem de FLUX e EPISTEME: conhecimento que se sustenta porque pode ser justificado.",
}

export default function EmpresaPage() {
  return (
    <SiteShell ativo="/empresa">
      <section className="bg-grid">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="type-eyebrow mb-5 text-primary">Fluxteme</p>
          <h1 className="max-w-4xl font-display text-5xl font-light leading-[1.05] text-foreground sm:text-6xl">
            Governança e compliance para contratação PJ.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
            A Fluxteme ajuda empresas que contratam prestadores de serviço a sair da confiança e chegar à evidência: cada serviço,
            cada validação e cada pagamento com registro que se sustenta.
          </p>
        </div>
      </section>

      <SiteSection eyebrow="O nome" titulo="FLUX + (EPIS)TEME.">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-base leading-relaxed text-text-secondary">
            <p>
              <span className="text-foreground">Flux</span>, do latim <em>fluxus</em>: o movimento contínuo da operação.{" "}
              <span className="text-foreground">Episteme</span>, do grego <span lang="grc">ἐπιστήμη</span>: o conhecimento que se
              sustenta porque pode ser justificado.
            </p>
            <p>Lê-se flu-ks-tê-me, com a tônica na terceira sílaba.</p>
          </div>
          <dl className="divide-y divide-border rounded-lg border border-border bg-card">
            <div className="p-5">
              <dt className="type-eyebrow text-text-tertiary">Doxa · opinião</dt>
              <dd className="mt-2 text-sm leading-relaxed text-text-secondary">
                O que se acredita sem poder demonstrar: a nota que parece certa, o contrato que deve estar em ordem, o pagamento
                aprovado porque alguém confiou em alguém.
              </dd>
            </div>
            <div className="p-5">
              <dt className="type-eyebrow text-primary">Episteme · conhecimento justificado</dt>
              <dd className="mt-2 text-sm leading-relaxed text-foreground">
                O que se sustenta porque há evidência, rastro e verificação: a aprovação com autor e horário, a trilha que não se
                reescreve.
              </dd>
            </div>
          </dl>
        </div>
      </SiteSection>

      <SiteSection
        eyebrow="Módulos"
        titulo="Uma plataforma, capacidades por função."
        descricao="O FluxoPay é o primeiro módulo em operação. As demais capacidades estão em desenvolvimento e aparecem aqui quando estiverem disponíveis."
      >
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          <Link
            href="/fluxopay"
            className="group flex flex-wrap items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-surface"
          >
            <div>
              <p className="font-display text-xl font-normal text-foreground">FluxoPay</p>
              <p className="mt-1 text-sm text-text-secondary">Pagamento de prestadores: lançamento, aprovação, nota fiscal e pagamento.</p>
            </div>
            <span className="flex items-center gap-3">
              <StatusIndicator status="ativo" label="Em operação" />
              <ArrowRight className="h-4 w-4 text-text-tertiary transition-colors group-hover:text-foreground" />
            </span>
          </Link>
          {[
            ["Contratos", "Contratos digitais dos prestadores, com assinatura e versões."],
            ["Fiscal", "Validação da nota fiscal contra contrato e medição da entrega."],
          ].map(([nome, desc]) => (
            <div key={nome} className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
              <div>
                <p className="font-display text-xl font-normal text-text-secondary">{nome}</p>
                <p className="mt-1 text-sm text-text-tertiary">{desc}</p>
              </div>
              <StatusIndicator status="processando" label="Em desenvolvimento" />
            </div>
          ))}
        </div>
      </SiteSection>

      <SiteSection eyebrow="Dados da empresa">
        <dl className="max-w-2xl divide-y divide-border rounded-lg border border-border bg-card">
          {[
            ["Razão social", "Fluxteme Tecnologia Desenvolvimento de Software LTDA"],
            ["Nome fantasia", "Fluxteme Tech"],
            ["CNPJ", "69.046.679/0001-56"],
            ["Contato", "contato@fluxteme.com.br"],
          ].map(([r, v]) => (
            <div key={r} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="type-eyebrow pt-0.5 text-text-tertiary">{r}</dt>
              <dd className={r === "CNPJ" ? "type-audit text-sm text-foreground" : "text-sm text-foreground"}>{v}</dd>
            </div>
          ))}
        </dl>
      </SiteSection>
    </SiteShell>
  )
}
