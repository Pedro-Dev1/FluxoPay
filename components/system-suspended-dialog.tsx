"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface SystemSuspendedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: string | null
}

export function SystemSuspendedDialog({ open, onOpenChange, reason }: SystemSuspendedDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle">
              <AlertTriangle className="h-6 w-6 text-danger" />
            </div>
            <AlertDialogTitle className="text-xl">Sistema Suspenso</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-4 text-base">
            O sistema esta temporariamente suspenso. Nenhuma acao pode ser realizada no momento. Entre em contato com o administrador.
          </AlertDialogDescription>
          {reason && (
            <div className="mt-4 p-3 rounded-lg bg-danger-subtle border border-danger/30">
              <p className="text-sm font-medium text-danger">Motivo:</p>
              <p className="text-sm text-danger mt-1">{reason}</p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
