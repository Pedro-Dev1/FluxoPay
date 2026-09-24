"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { PLATAFORMA, itemAtivo } from "@/lib/navegacao"

// Abas do painel Super Admin. Mesma fonte da sidebar (lib/navegacao.ts),
// para as duas navegações nunca divergirem.
export function AdminNav() {
  const pathname = usePathname()
  const ativo = itemAtivo(PLATAFORMA, pathname)

  return (
    <nav className="-mx-1 flex items-end gap-1 overflow-x-auto border-b border-border px-1" aria-label="Painel Super Admin">
      {PLATAFORMA[0].itens.map((item) => {
        const isActive = item.href === ativo?.item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors duration-150",
              isActive
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-text-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
