import type React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full py-3 px-6 border-b border-border">
        <nav className="max-w-7xl mx-auto flex items-center justify-end gap-1">
          <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-foreground transition-colors">
            Login
          </Link>
          <Link href="/faq" className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Link href="/termos" className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-foreground transition-colors">
            Termos
          </Link>
          <Link href="/privacidade" className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-foreground transition-colors">
            Privacidade
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[360px]">
          <div className="text-center mb-6">
            <BrandLogo className="h-7 mx-auto" />
          </div>

          <div className="bg-card border border-border rounded-lg p-6">{children}</div>

          <p className="text-center text-xs text-text-tertiary mt-6">
            Ao acessar, você concorda com nossos{" "}
            <Link href="/termos" className="text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </main>

      <footer className="py-5 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-text-tertiary">
          <p>© 2026 Fluxteme Tecnologia Desenvolvimento de Software LTDA · CNPJ 69.046.679/0001-56</p>
          <div className="flex items-center gap-3">
            <span>Suporte: contato@fluxteme.com.br</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
