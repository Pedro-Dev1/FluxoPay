import { ErrorState } from "@/components/ui/error-state"

// Mantido como atalho das páginas do painel Super Admin; o visual é o
// ErrorState padrão do design system.
export function AdminErroCarregamento({ mensagem }: { mensagem?: string }) {
  return (
    <ErrorState
      description={mensagem || "A consulta aos dados falhou. Recarregue a página; se persistir, verifique o log do servidor."}
    />
  )
}
