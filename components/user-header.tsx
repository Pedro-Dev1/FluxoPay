"use client"

import { usePathname } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useValoresVisibility } from "@/contexts/valores-visibility-context"
import { Button } from "@/components/ui/button"
import { NotificacoesBell } from "@/components/notificacoes-bell"
import { TenantSwitcher } from "@/components/tenant-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { gruposDeNavegacao, itemAtivo } from "@/lib/navegacao"

interface UserHeaderProps {
  nomeCompleto: string
  email: string
  tipoAcesso?: string
  cnpj?: string
  salario?: number
  isSuperAdmin?: boolean
  viewingAsTenantId?: string | null
  tenants?: { id: string; nome: string }[]
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase()
}

// DESIGN_SYSTEM.md §14. Só o que é funcional: onde estou, ferramentas de
// contexto e quem está logado.
export function UserHeader({
  nomeCompleto,
  email,
  tipoAcesso,
  cnpj,
  salario,
  isSuperAdmin,
  viewingAsTenantId,
  tenants,
}: UserHeaderProps) {
  const pathname = usePathname()
  const { valoresVisiveis, toggleValoresVisiveis, mascararValor } = useValoresVisibility()
  const ativo = itemAtivo(gruposDeNavegacao({ tipoAcesso, isSuperAdmin, viewingAsTenantId }), pathname)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-8">
        {/* Espaço do botão de menu no celular */}
        <div className="w-9 shrink-0 lg:hidden" />

        <nav aria-label="Você está em" className="flex min-w-0 flex-1 items-center gap-2 text-sm">
          {ativo && (
            <>
              <span className="type-eyebrow hidden shrink-0 text-text-tertiary sm:inline">{ativo.grupo.titulo}</span>
              <span className="hidden text-border-strong sm:inline" aria-hidden="true">
                /
              </span>
              <span className="truncate font-medium text-foreground" aria-current="page">
                {ativo.item.label}
              </span>
            </>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {isSuperAdmin && <TenantSwitcher tenants={tenants || []} viewingAsTenantId={viewingAsTenantId ?? null} />}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleValoresVisiveis}
            aria-pressed={!valoresVisiveis}
            aria-label={valoresVisiveis ? "Ocultar valores" : "Mostrar valores"}
            title={valoresVisiveis ? "Ocultar valores" : "Mostrar valores"}
          >
            {valoresVisiveis ? <Eye /> : <EyeOff className="text-foreground" />}
          </Button>
          <ThemeToggle />
          <NotificacoesBell />
        </div>

        <div className="ml-1 hidden items-center gap-3 border-l border-border pl-4 md:flex">
          <div className="min-w-0 text-right leading-tight">
            <p className="max-w-[14rem] truncate text-[13px] font-medium text-foreground">{nomeCompleto}</p>
            <p className="max-w-[14rem] truncate text-xs text-text-tertiary">
              {salario !== undefined && salario !== null ? (
                <span className="tabular-nums">{mascararValor(salario)}</span>
              ) : (
                email
              )}
              {cnpj && <span className="type-audit ml-2">{cnpj}</span>}
            </p>
          </div>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-medium text-text-secondary"
            aria-hidden="true"
          >
            {iniciais(nomeCompleto)}
          </div>
        </div>
      </div>
    </header>
  )
}
