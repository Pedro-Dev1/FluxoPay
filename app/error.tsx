"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/error-state"

// Erro ao renderizar uma página (DESIGN_SYSTEM.md §29). Mostra o que houve e
// como seguir; o digest vira código de referência para o suporte achar no log.
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <ErrorState
        referencia={error.digest}
        action={
          <>
            <Button onClick={reset}>Carregar de novo</Button>
            <Button variant="outline" asChild>
              <a href="/">Ir para o início</a>
            </Button>
          </>
        }
      />
    </div>
  )
}
