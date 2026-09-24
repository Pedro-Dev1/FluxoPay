"use client"

import { AlertTriangle, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SystemSuspendedScreenProps {
  reason?: string | null
}

export function SystemSuspendedScreen({ reason }: SystemSuspendedScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg bg-card border-danger/30">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-danger-subtle flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-danger" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Sistema Temporariamente Suspenso</h1>
            <p className="text-text-tertiary">
              O Fluxteme está em manutenção no momento.
            </p>
          </div>

          {reason && (
            <div className="p-4 rounded-lg bg-danger-subtle border border-danger/30 text-left">
              <p className="text-sm font-medium text-danger mb-1">Motivo:</p>
              <p className="text-sm text-danger">{reason}</p>
            </div>
          )}

          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-sm text-text-tertiary">
              Em caso de duvidas, entre em contato:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a
                href="mailto:contato@fluxteme.com.br"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                contato@fluxteme.com.br
              </a>
            </div>
          </div>

          <p className="text-xs text-text-secondary">
            Agradecemos sua compreensao. O sistema voltara ao normal em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
