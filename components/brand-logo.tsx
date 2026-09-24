import { cn } from "@/lib/utils"

// Logo oficial (public/logo.png): traço e nome em branco, barra em ciano,
// fundo transparente — feito para o tema escuro. No tema claro, invert +
// hue-rotate(180°) deixa o branco escuro e devolve a barra ao ciano.
export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Fluxteme"
      width={1976}
      height={390}
      className={cn("h-6 w-auto invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0", className)}
    />
  )
}
