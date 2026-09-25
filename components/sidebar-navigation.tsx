"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { IconeExpandir, IconeRecolher, IconeSair } from "@/components/icons/fx-icons"
import { BrandLogo } from "@/components/brand-logo"
import { cn } from "@/lib/utils"
import { logout } from "@/app/actions/auth"
import { contarPendencias } from "@/app/actions/contadores"
import { gruposDeNavegacao, itemAtivo, type GrupoNav, type Pendencias } from "@/lib/navegacao"

interface SidebarNavigationProps {
  tipoAcesso?: string
  isSuperAdmin?: boolean
  viewingAsTenantId?: string | null
}

const CHAVE_RECOLHIDA = "fluxteme:sidebar-recolhida"
const LARGURA = { aberta: "14rem", recolhida: "4rem" }

// DESIGN_SYSTEM.md §13. Navy nos dois temas (base estrutural, 60% do
// Manual). Destaque aqua só no item ativo e nos contadores.
export function SidebarNavigation({ tipoAcesso, isSuperAdmin, viewingAsTenantId }: SidebarNavigationProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [recolhida, setRecolhida] = useState(false)
  const [pendencias, setPendencias] = useState<Pendencias>({ aprovacoes: 0, painelFinanceiro: 0, correcoes: 0, acompanhamento: 0 })

  const grupos = gruposDeNavegacao({ tipoAcesso, isSuperAdmin, viewingAsTenantId })
  const ativo = itemAtivo(grupos, pathname)

  useEffect(() => {
    try {
      setRecolhida(localStorage.getItem(CHAVE_RECOLHIDA) === "1")
    } catch {}
  }, [])

  // A largura vira variável CSS para o conteúdo (layout) acompanhar.
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", recolhida ? LARGURA.recolhida : LARGURA.aberta)
  }, [recolhida])

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    const buscar = async () => {
      try {
        setPendencias(await contarPendencias())
      } catch {}
    }
    buscar()
    const intervalo = setInterval(buscar, 30000)
    return () => clearInterval(intervalo)
  }, [])

  const alternarRecolhida = () => {
    setRecolhida((v) => {
      try {
        localStorage.setItem(CHAVE_RECOLHIDA, v ? "0" : "1")
      } catch {}
      return !v
    })
  }

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-control border border-border bg-card text-foreground lg:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-150 lg:flex",
          recolhida ? "w-16" : "w-56",
        )}
        aria-label="Navegação principal"
      >
        <Painel
          grupos={grupos}
          ativoHref={ativo?.item.href}
          pendencias={pendencias}
          recolhida={recolhida}
          mostrarSair={!!tipoAcesso}
          rodape={
            <button
              type="button"
              onClick={alternarRecolhida}
              className={cn(
                "flex h-8 w-full items-center gap-3 rounded-control px-3 text-[13px] text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground",
                recolhida && "justify-center px-0",
              )}
              aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
              title={recolhida ? "Expandir menu" : "Recolher menu"}
            >
              {recolhida ? <IconeExpandir className="h-4 w-4" /> : <IconeRecolher className="h-4 w-4" />}
              {!recolhida && <span>Recolher menu</span>}
            </button>
          }
        />
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-brand-navy/70 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside
            className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar shadow-float animate-in slide-in-from-left duration-200 lg:hidden"
            aria-label="Navegação principal"
          >
            <Painel grupos={grupos} ativoHref={ativo?.item.href} pendencias={pendencias} recolhida={false} mostrarSair={!!tipoAcesso} />
          </aside>
        </>
      )}
    </>
  )
}

function Painel({
  grupos,
  ativoHref,
  pendencias,
  recolhida,
  mostrarSair,
  rodape,
}: {
  grupos: GrupoNav[]
  ativoHref?: string
  pendencias: Pendencias
  recolhida: boolean
  mostrarSair: boolean
  rodape?: React.ReactNode
}) {
  return (
    <>
      <div className={cn("flex h-14 shrink-0 items-center border-b border-sidebar-border", recolhida ? "justify-center" : "px-5")}>
        <Link
          href="/"
          aria-label="Fluxteme · Módulo FluxoPay — início"
          title={recolhida ? "Módulo FluxoPay" : undefined}
          className="rounded-control focus-visible:outline-offset-4"
        >
          {recolhida ? (
            <BrandLogo forma="icone" fundo="escuro" className="h-8 w-8" />
          ) : (
            <span className="flex flex-col gap-1.5">
              <BrandLogo forma="assinatura" fundo="escuro" className="h-[18px]" />
              <span className="type-eyebrow text-[9.5px] leading-none tracking-[0.2em] text-sidebar-active">Módulo FluxoPay</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        {grupos.map((grupo, i) => (
          <div key={grupo.titulo} className={cn(i > 0 && "mt-5")}>
            {recolhida ? (
              i > 0 && <div className="mx-3 mb-3 border-t border-sidebar-border" aria-hidden="true" />
            ) : (
              <p className="type-eyebrow mb-1.5 px-3 text-[10px] text-sidebar-group">{grupo.titulo}</p>
            )}
            <ul className="space-y-px">
              {grupo.itens.map((item) => {
                const Icon = item.icon
                const isAtivo = item.href === ativoHref
                const contador = item.contador ? pendencias[item.contador] : 0
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isAtivo ? "page" : undefined}
                      title={recolhida ? item.label : undefined}
                      className={cn(
                        "relative flex h-8 items-center gap-3 rounded-control text-[13px] transition-colors duration-150",
                        recolhida ? "justify-center" : "px-3",
                        isAtivo
                          ? "bg-sidebar-hover font-medium text-sidebar-foreground"
                          : "text-sidebar-muted hover:bg-sidebar-hover/70 hover:text-sidebar-foreground",
                      )}
                    >
                      {isAtivo && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-sidebar-active" aria-hidden="true" />}
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", isAtivo ? "text-sidebar-active" : "text-sidebar-muted")} />
                      {!recolhida && <span className="flex-1 truncate">{item.label}</span>}
                      {contador > 0 &&
                        (recolhida ? (
                          <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-sidebar-active" aria-label={`${contador} pendentes`} />
                        ) : (
                          <span className="ml-auto min-w-5 rounded-full bg-sidebar-active px-1.5 text-center font-mono text-[10px] font-medium leading-4 text-brand-navy tabular-nums">
                            {contador}
                          </span>
                        ))}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-px border-t border-sidebar-border p-2">
        {mostrarSair && (
          <button
            type="button"
            onClick={() => logout()}
            title={recolhida ? "Sair" : undefined}
            className={cn(
              "flex h-8 w-full items-center gap-3 rounded-control text-[13px] text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground",
              recolhida ? "justify-center" : "px-3",
            )}
          >
            <IconeSair className="h-4 w-4" />
            {!recolhida && <span>Sair</span>}
          </button>
        )}
        {rodape}
      </div>
    </>
  )
}
