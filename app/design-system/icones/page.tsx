import { notFound } from "next/navigation"
import * as Icones from "@/components/icons/fx-icons"
import { PageHeader } from "@/components/ui/page-header"

// Referência do conjunto de ícones próprios, só em desenvolvimento.
export default function IconesPage() {
  if (process.env.NODE_ENV === "production") notFound()
  const lista = Object.entries(Icones).filter(([nome]) => nome.startsWith("Icone")) as [string, Icones.FxIcon][]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader eyebrow="Sistema" title="Ícones Fluxteme" description="Traço 1,5, pontas retas, canto do F no alto à esquerda." />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4 lg:grid-cols-6">
        {lista.map(([nome, Icone]) => (
          <div key={nome} className="flex flex-col items-center gap-3 bg-card p-5">
            <Icone className="h-12 w-12 text-foreground" />
            <div className="flex items-center gap-3 text-text-secondary">
              <Icone className="h-4 w-4" />
              <Icone className="h-5 w-5" />
            </div>
            <p className="type-audit text-text-tertiary">{nome.replace("Icone", "")}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
