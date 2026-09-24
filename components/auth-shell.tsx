import type React from "react"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/site/site-shell"

// Área de entrada (DESIGN_SYSTEM.md §10): mesma moldura do site institucional,
// grade de fundo só nesta faixa.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="bg-grid flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[380px]">
          <p className="type-eyebrow mb-4 text-center text-primary">FluxoPay · um módulo Fluxteme</p>

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

      <SiteFooter />
    </div>
  )
}
