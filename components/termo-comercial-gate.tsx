"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useTermsAcceptance } from "@/components/terms-acceptance-provider"
import { TermoComercialConteudo } from "@/components/termo-comercial-conteudo"
import {
  aceitarTermoComercial,
  buscarTermoComercialPendente,
  recusarTermoComercial,
} from "@/app/actions/termos-comerciais"
import { logout } from "@/app/actions/auth"
import { CARGOS_TERMO_COMERCIAL, type TermoComercial } from "@/types/termo-comercial"

interface TermoComercialGateProps {
  tipoAcesso: string
  isSuperAdmin: boolean
  userName?: string
}

// Bloqueia Adm e Financeiro até aceitarem a versão em vigor dos termos
// comerciais. Espera o termo de uso (TermsAcceptanceProvider) ser resolvido
// primeiro, para os dois modais nunca abrirem juntos.
export function TermoComercialGate({ tipoAcesso, isSuperAdmin, userName }: TermoComercialGateProps) {
  const router = useRouter()
  const { hasAcceptedTerms, isLoading } = useTermsAcceptance()
  const [termo, setTermo] = useState<TermoComercial | null>(null)
  const [leuAteOFim, setLeuAteOFim] = useState(false)
  const [concorda, setConcorda] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [confirmandoRecusa, setConfirmandoRecusa] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const precisaVerificar = !isSuperAdmin && CARGOS_TERMO_COMERCIAL.includes(tipoAcesso)

  useEffect(() => {
    if (!precisaVerificar || isLoading || !hasAcceptedTerms) return
    buscarTermoComercialPendente()
      .then(setTermo)
      .catch((error) => {
        // Mesmo critério do termo de uso: falha na verificação não bloqueia.
        console.error("[v0] Erro ao verificar termo comercial:", error)
      })
  }, [precisaVerificar, isLoading, hasAcceptedTerms])

  // Texto curto que cabe sem rolagem já conta como lido.
  const verificarFim = useCallback(() => {
    const el = scrollRef.current
    if (el && el.scrollHeight - el.scrollTop <= el.clientHeight + 24) setLeuAteOFim(true)
  }, [])

  useEffect(() => {
    if (!termo || confirmandoRecusa) return
    const id = requestAnimationFrame(verificarFim)
    return () => cancelAnimationFrame(id)
  }, [termo, confirmandoRecusa, verificarFim])

  if (!termo) return null

  const aceitar = async () => {
    setEnviando(true)
    try {
      const resultado = await aceitarTermoComercial(termo.id)
      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }
      toast.success("Termos comerciais aceitos")
      setTermo(null)
      router.refresh()
    } catch {
      toast.error("Não foi possível registrar o aceite. Verifique sua conexão e tente de novo.")
    } finally {
      setEnviando(false)
    }
  }

  const recusar = async () => {
    setEnviando(true)
    try {
      const resultado = await recusarTermoComercial(termo.id)
      if (!resultado.success) {
        toast.error(resultado.error)
        setEnviando(false)
        return
      }
      await logout()
    } catch {
      toast.error("Não foi possível registrar a recusa. Verifique sua conexão e tente de novo.")
      setEnviando(false)
    }
  }

  if (confirmandoRecusa) {
    return (
      <Dialog open>
        <DialogContent
          className="sm:max-w-md [&>button:last-child]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Recusar termos comerciais</DialogTitle>
            <DialogDescription>
              A recusa fica registrada e você sai da conta. No próximo acesso os termos aparecem de novo, e o uso do
              sistema continua bloqueado até que sejam aceitos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setConfirmandoRecusa(false)} disabled={enviando}>
              Voltar aos termos
            </Button>
            <Button variant="destructive" onClick={recusar} disabled={enviando}>
              {enviando ? "Registrando..." : "Recusar e sair"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open>
      <DialogContent
        className="flex flex-col w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] p-0 gap-0 overflow-hidden [&>button:last-child]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 sm:px-6 pt-5 pb-3 border-b border-border shrink-0 text-left">
          <DialogTitle className="text-lg">{termo.titulo}</DialogTitle>
          <DialogDescription className="text-sm">
            {userName ? `${userName}, leia` : "Leia"} os termos comerciais antes de continuar. Versão {termo.versao}.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollRef}
          onScroll={verificarFim}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <TermoComercialConteudo conteudo={termo.conteudo} />
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 sm:px-6 pb-4 pt-3 space-y-3">
          {!leuAteOFim && (
            <p className="text-center text-xs text-muted-foreground">Role até o final para habilitar o aceite</p>
          )}

          <div className="flex items-start gap-3">
            <Checkbox
              id="aceite-termo-comercial"
              checked={concorda}
              onCheckedChange={(v) => setConcorda(v === true)}
              disabled={!leuAteOFim}
              className="mt-0.5 shrink-0"
            />
            <Label
              htmlFor="aceite-termo-comercial"
              className={`text-sm leading-relaxed cursor-pointer ${!leuAteOFim ? "text-muted-foreground" : ""}`}
            >
              Li e aceito os termos comerciais acima, versão {termo.versao}.
            </Label>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmandoRecusa(true)} disabled={enviando}>
              Recusar
            </Button>
            <Button onClick={aceitar} disabled={!concorda || enviando}>
              {enviando ? "Registrando..." : "Aceitar termos comerciais"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
