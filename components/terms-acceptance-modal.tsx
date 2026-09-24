"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { acceptTerms, declineTerms } from "@/app/actions/terms"
import { CURRENT_TERMS_VERSION } from "@/types/terms"
import { logout } from "@/app/actions/auth"
import { toast } from "sonner"

interface TermsAcceptanceModalProps {
  isOpen: boolean
  onAccept?: () => void
  userName?: string
  userId?: string
}

export function TermsAcceptanceModal({ isOpen, onAccept, userName, userId }: TermsAcceptanceModalProps) {
  const router = useRouter()
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [hasCheckedTerms, setHasCheckedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false)
      setHasCheckedTerms(false)
      setShowDeclineConfirm(false)
    }
  }, [isOpen])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50
    if (isAtBottom) {
      setHasScrolledToBottom(true)
    }
  }, [])

  const handleAccept = async () => {
    if (!hasCheckedTerms) {
      toast.error("Marque que leu e concorda com os termos para continuar.")
      return
    }

    if (!userId) {
      toast.error("Não foi possível identificar sua conta. Entre de novo.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await acceptTerms(userId)
      if (result.success) {
        toast.success("Termos de uso aceitos.")
        onAccept?.()
        router.refresh()
      } else {
        toast.error(result.error || "Não foi possível registrar o aceite. Tente de novo.")
      }
    } catch (error) {
      toast.error("Não foi possível registrar o aceite. Verifique a conexão e tente de novo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDecline = async () => {
    setIsSubmitting(true)
    try {
      if (userId) {
        await declineTerms(userId)
      }
      toast.info("Recusa registrada. Você foi desconectado.")
      await logout()
    } catch (error) {
      toast.error("Não foi possível registrar a recusa. Tente de novo.")
      setIsSubmitting(false)
    }
  }

  if (showDeclineConfirm) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Recusar termos de uso</DialogTitle>
            <DialogDescription>
              Ao recusar os termos de uso, você será desconectado do sistema e não poderá acessar o Fluxteme até aceitar os termos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowDeclineConfirm(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Registrando..." : "Recusar e sair"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="flex flex-col w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] p-0 gap-0 overflow-hidden [&>button:last-child]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header fixo */}
        <DialogHeader className="shrink-0 space-y-2 border-b border-border px-4 pb-4 pt-5 sm:px-6">
          <p className="type-eyebrow text-primary">Termos de uso · versão {CURRENT_TERMS_VERSION}</p>
          <DialogTitle>Termos de uso do Fluxteme</DialogTitle>
          <DialogDescription>
            {userName ? `${userName}, leia` : "Leia"} os termos antes de continuar. O aceite fica registrado com data, IP e dispositivo.
          </DialogDescription>
        </DialogHeader>

        {/* Área de scroll — ocupa todo o espaço disponível */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="space-y-4 py-4 pr-2 text-sm">
            <section>
              <h3 className="type-intertitle mb-2 text-foreground">1. Aceitação dos termos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar o sistema Fluxteme, você concorda em cumprir e estar vinculado a estes
                Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar
                o sistema.
              </p>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">2. Descrição do serviço</h3>
              <p className="text-muted-foreground leading-relaxed">
                O Fluxteme é um sistema de gestão de pagamentos para colaboradores, permitindo o controle
                de pedidos, notas fiscais, aprovações e pagamentos. O sistema é disponibilizado pela empresa
                contratante para uso exclusivo de seus colaboradores autorizados.
              </p>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">3. Cadastro e credenciais</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você é responsável por manter a confidencialidade de suas credenciais de acesso (email e senha).
                Qualquer atividade realizada com suas credenciais será de sua responsabilidade. Você deve
                notificar imediatamente a administração em caso de uso não autorizado de sua conta.
              </p>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">4. Uso adequado</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você concorda em utilizar o sistema apenas para fins legítimos relacionados às suas atividades
                profissionais. É expressamente proibido:
              </p>
              <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
                <li>Fornecer informações falsas ou enganosas</li>
                <li>Tentar acessar áreas ou funcionalidades não autorizadas</li>
                <li>Realizar qualquer ação que possa comprometer a segurança do sistema</li>
                <li>Compartilhar suas credenciais de acesso com terceiros</li>
                <li>Utilizar o sistema para atividades ilegais ou não autorizadas</li>
              </ul>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">5. Privacidade e dados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados pessoais serão tratados de acordo com a Lei Geral de Proteção de Dados (LGPD).
                Coletamos apenas os dados necessários para a operação do sistema, incluindo:
              </p>
              <ul className="mt-2 list-disc pl-6 text-muted-foreground space-y-1">
                <li>Dados de identificação (nome, email, CPF/CNPJ)</li>
                <li>Dados financeiros (informações bancárias para pagamento)</li>
                <li>Logs de acesso e atividades no sistema</li>
                <li>Informações de dispositivo e IP para fins de segurança</li>
              </ul>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">6. Propriedade intelectual</h3>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo do sistema, incluindo mas não limitado a textos, gráficos, logos, ícones,
                imagens e software, é protegido por direitos autorais e outras leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">7. Limitação de responsabilidade</h3>
              <p className="text-muted-foreground leading-relaxed">
                O sistema é fornecido &quot;como está&quot;. Não garantimos que o serviço será ininterrupto ou
                livre de erros. Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais
                decorrentes do uso do sistema.
              </p>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">8. Modificações dos termos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas
                serão comunicadas através do sistema. O uso continuado após as modificações constitui aceitação
                dos novos termos.
              </p>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">9. Encerramento</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seu acesso ao sistema pode ser suspenso ou encerrado a qualquer momento, com ou sem aviso prévio,
                por violação destes termos ou por determinação da empresa contratante.
              </p>
            </section>

            <section>
              <h3 className="type-intertitle mb-2 text-foreground">10. Disposições gerais</h3>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos constituem o acordo integral entre você e o Fluxteme. A invalidade de qualquer
                disposição não afetará a validade das demais. O não exercício de qualquer direito não implica
                renúncia ao mesmo.
              </p>
            </section>

            <p className="type-audit border-t border-border pt-4 text-text-tertiary">
              Última atualização: janeiro de 2025 · versão {CURRENT_TERMS_VERSION}
            </p>
          </div>
        </div>

        {/* Footer fixo — checkbox + botões sempre visíveis */}
        <div className="shrink-0 space-y-3 border-t border-border bg-popover px-4 pb-4 pt-3 sm:px-6">
          {!hasScrolledToBottom && (
            <p className="text-center text-xs text-muted-foreground">
              Role até o final para habilitar o aceite
            </p>
          )}

          <div className="flex items-start gap-3">
            <Checkbox
              id="accept-terms"
              checked={hasCheckedTerms}
              onCheckedChange={(checked) => setHasCheckedTerms(checked === true)}
              disabled={!hasScrolledToBottom}
              className="mt-0.5 shrink-0"
            />
            <Label
              htmlFor="accept-terms"
              className={`text-sm leading-relaxed cursor-pointer ${!hasScrolledToBottom ? 'text-muted-foreground' : ''}`}
            >
              Li e concordo com os Termos de Uso do Fluxteme. Entendo que meus dados serão processados conforme
              descrito acima e que devo utilizar o sistema de forma responsável.
            </Label>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeclineConfirm(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Recusar
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!hasCheckedTerms || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Registrando..." : "Aceitar termos de uso"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
