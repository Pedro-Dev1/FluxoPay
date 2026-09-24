import { PageSkeleton } from "@/components/ui/loading-states"

// Carregamento padrão de qualquer rota sem loading.tsx próprio: esqueleto
// com a forma de cabeçalho + tabela (DESIGN_SYSTEM.md §28).
export default function Loading() {
  return <PageSkeleton />
}
