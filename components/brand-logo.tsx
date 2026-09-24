import { cn } from "@/lib/utils"

// Manual de Marca v2.0 — seções 03, 07 e 08.
// · Assinatura horizontal: topo do produto, 32 px de altura, sem slogan.
// · Ícone: áreas comprimidas (sidebar recolhida, avatar); mínimo 32 px.
// · A versão é escolhida pela luminância do fundo, nunca por estilo:
//     fundo claro  → haste navy, barra teal  (public/*-claro.png)
//     fundo escuro → haste branca, barra aqua (public/logo.png, icone.png)
// Os arquivos são os originais recebidos; nada aqui recria o wordmark,
// aplica sombra, filtro ou altera proporção.
const ARQUIVOS = {
  assinatura: { escuro: "/logo.png", claro: "/logo-claro.png", largura: 1976, altura: 390 },
  icone: { escuro: "/icone.png", claro: "/icone-claro.png", largura: 474, altura: 474 },
} as const

interface BrandLogoProps {
  forma?: keyof typeof ARQUIVOS
  // "auto": segue o tema. "escuro": o fundo é sempre escuro (ex.: sidebar navy).
  fundo?: "auto" | "escuro" | "claro"
  className?: string
}

export function BrandLogo({ forma = "assinatura", fundo = "auto", className }: BrandLogoProps) {
  const a = ARQUIVOS[forma]
  const tamanho = cn(forma === "assinatura" ? "h-5 w-auto" : "h-8 w-8", className)
  const img = (src: string, extra?: string) => (
    <img src={src} alt="Fluxteme" width={a.largura} height={a.altura} className={cn(tamanho, "select-none", extra)} draggable={false} />
  )

  if (fundo === "escuro") return img(a.escuro, "block")
  if (fundo === "claro") return img(a.claro, "block")
  return (
    <>
      {img(a.claro, "block dark:hidden")}
      {img(a.escuro, "hidden dark:block")}
    </>
  )
}
