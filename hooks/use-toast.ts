import type { ReactNode } from "react"
import { toast as sonner } from "sonner"

// Sistema único de feedback: tudo passa pelo Sonner (components/ui/sonner.tsx).
// Este hook mantém a API antiga — toast({ title, description, variant }) —
// para os componentes que já a usavam, e só repassa para o Sonner.
// Código novo deve importar `toast` de "sonner" direto (DESIGN_SYSTEM.md §22).
type Opcoes = {
  title?: ReactNode
  description?: ReactNode
  variant?: "default" | "destructive"
}

export function toast({ title, description, variant }: Opcoes) {
  return variant === "destructive" ? sonner.error(title, { description }) : sonner.success(title, { description })
}

export function useToast() {
  return { toast, dismiss: sonner.dismiss }
}
