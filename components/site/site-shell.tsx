import type { ReactNode } from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Moldura das páginas públicas (site institucional, entrada, textos legais).
// Topo com a assinatura horizontal, como pede o Manual para "topo de produto".

const NAV = [
  { href: "/fluxopay", label: "FluxoPay" },
  { href: "/seguranca", label: "Segurança" },
  { href: "/empresa", label: "Empresa" },
  { href: "/faq", label: "Perguntas frequentes" },
]

export function SiteHeader({ ativo }: { ativo?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/site" aria-label="Fluxteme — início" className="shrink-0">
          <BrandLogo className="h-5" />
        </Link>
        <nav aria-label="Site" className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo === item.href ? "page" : undefined}
              className={cn(
                "rounded-control px-3 py-1.5 text-sm transition-colors duration-150",
                ativo === item.href ? "text-foreground" : "text-text-secondary hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </div>
      {/* Navegação no celular: rolagem horizontal, sem menu escondido */}
      <nav aria-label="Site" className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-control px-2.5 py-1 text-[13px]",
              ativo === item.href ? "bg-surface text-foreground" : "text-text-secondary",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <BrandLogo className="h-5" />
          <p className="max-w-sm text-sm text-text-secondary">
            Governança e compliance para contratação de prestadores PJ. O FluxoPay é o módulo de pagamento de prestadores da
            Fluxteme.
          </p>
        </div>
        <div>
          <p className="type-eyebrow mb-3 text-text-tertiary">Produto</p>
          <ul className="space-y-2 text-sm">
            {[
              ["/fluxopay", "FluxoPay"],
              ["/seguranca", "Segurança"],
              ["/faq", "Perguntas frequentes"],
              ["/login", "Entrar"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-text-secondary hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="type-eyebrow mb-3 text-text-tertiary">Fluxteme</p>
          <ul className="space-y-2 text-sm">
            {[
              ["/empresa", "Empresa"],
              ["/termos", "Termos de uso"],
              ["/privacidade", "Política de privacidade"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-text-secondary hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a href="mailto:contato@fluxteme.com.br" className="text-text-secondary hover:text-foreground">
                contato@fluxteme.com.br
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-text-tertiary sm:px-6 lg:px-8">
          © 2026 Fluxteme Tecnologia Desenvolvimento de Software LTDA · CNPJ{" "}
          <span className="type-audit">69.046.679/0001-56</span>
        </p>
      </div>
    </footer>
  )
}

export function SiteShell({ children, ativo }: { children: ReactNode; ativo?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader ativo={ativo} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

/** Faixa de seção do site: largura, respiro vertical e régua superior. */
export function SiteSection({
  eyebrow,
  titulo,
  descricao,
  children,
  className,
  id,
}: {
  eyebrow?: string
  titulo?: string
  descricao?: ReactNode
  children?: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={cn("border-t border-border", className)}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {(eyebrow || titulo) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && <p className="type-eyebrow mb-3 text-primary">{eyebrow}</p>}
            {titulo && <h2 className="font-display text-3xl font-light leading-tight text-foreground sm:text-4xl">{titulo}</h2>}
            {descricao && <p className="mt-4 text-base leading-relaxed text-text-secondary">{descricao}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
