"use client"

import type { ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pergunta direta com o objeto: "Excluir rascunho 1.1?" */
  title: string
  /** A consequência, explicitada. Obrigatório — confirmação sem consequência não informa nada. */
  consequence: ReactNode
  /** Mesmo verbo do botão que abriu o diálogo: "Excluir rascunho", não "Confirmar". */
  confirmLabel: string
  onConfirm: () => void | Promise<void>
  destructive?: boolean
  loading?: boolean
  cancelLabel?: string
  children?: ReactNode
}

// DESIGN_SYSTEM.md §30. Não fecha enquanto a ação está em curso; o botão de
// confirmação mostra progresso no próprio lugar.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  consequence,
  confirmLabel,
  onConfirm,
  destructive,
  loading,
  cancelLabel = "Cancelar",
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm text-text-secondary">{consequence}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              void onConfirm()
            }}
            disabled={loading}
            aria-busy={loading || undefined}
            className={cn(destructive && buttonVariants({ variant: "destructive" }))}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
