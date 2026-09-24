import type React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"

const LINKS = [
  { href: "/login", label: "Entrar" },
  { href: "/faq", label: "Perguntas frequentes" },
  { href: "/termos", label: "Termos" },
  { href: "/privacidade", label: "Privacidade" },
]

// Área institucional de entrada (DESIGN_SYSTEM.md §10): único lugar do
// produto com a grade de fundo. Assinatura horizontal no topo, como pede o
// Manual para "topo de produto".
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-4 sm:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4">
          <Link href="/login" aria-label="Fluxteme — entrar">
            <BrandLogo className="h-5" />
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Institucional">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap rounded-control px-2.5 py-1.5 text-[13px] text-text-secondary transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="bg-grid flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[380px]">
          <p className="type-eyebrow mb-4 text-center text-primary">Governança e compliance para contratação PJ</p>

          <div className="rounded-lg border border-border bg-card p-6">{children}</div>

          <p className="mt-6 text-center text-xs text-text-tertiary">
            Ao entrar, você concorda com os{" "}
            <Link href="/termos" className="text-primary hover:underline">
              Termos de uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de privacidade
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="border-t border-border px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-text-tertiary md:flex-row">
          <p>© 2026 Fluxteme Tecnologia Desenvolvimento de Software LTDA · CNPJ 69.046.679/0001-56</p>
          <a href="mailto:contato@fluxteme.com.br" className="hover:text-foreground">
            contato@fluxteme.com.br
          </a>
        </div>
      </footer>
    </div>
  )
}
