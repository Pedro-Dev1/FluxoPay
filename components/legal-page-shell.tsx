import type React from "react"
import type { LucideIcon } from "lucide-react"
import { SiteFooter, SiteHeader } from "@/components/site/site-shell"

export function LegalPageShell({
  icon: Icon,
  title,
  subtitle,
  meta,
  activeHref,
  children,
}: {
  icon?: LucideIcon
  title: string
  subtitle: string
  meta?: React.ReactNode
  activeHref: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader ativo={activeHref} />

      <main className="flex-1">
        <div className="bg-grid border-b border-border px-4 py-12">
          <div className="mx-auto max-w-3xl">
            {Icon && <Icon className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />}
            <h1 className="type-title mb-1.5 text-foreground">{title}</h1>
            <p className="text-sm text-text-secondary">{subtitle}</p>
            {meta && <div className="mt-3 flex items-center gap-2 text-xs text-text-tertiary">{meta}</div>}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-10">{children}</div>
      </main>

      <SiteFooter />
    </div>
  )
}
