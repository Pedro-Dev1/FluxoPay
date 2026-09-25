"use client"

import { useState } from "react"
import { CheckCircle2, OctagonAlert, Send, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuditId, AuditTimestamp } from "@/components/ui/audit"
import { enviarTesteDeEmail, type DiagnosticoEmail } from "@/app/actions/email-diagnostico"

function Linha({ ok, alerta, rotulo, valor }: { ok: boolean; alerta?: boolean; rotulo: string; valor: React.ReactNode }) {
  const Icone = ok ? (alerta ? TriangleAlert : CheckCircle2) : OctagonAlert
  const cor = ok ? (alerta ? "text-warning" : "text-success") : "text-danger"
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[14rem_1fr] sm:gap-6">
      <dt className="flex items-center gap-2 text-sm text-text-secondary">
        <Icone className={`h-4 w-4 shrink-0 ${cor}`} aria-hidden="true" />
        {rotulo}
      </dt>
      <dd className="min-w-0 text-sm text-foreground">{valor}</dd>
    </div>
  )
}

// Diagnóstico do envio de e-mail: configuração, resultado real dos últimos
// 30 dias (tabela email_envios) e teste de envio com a resposta do Resend.
export function AdminDiagnosticoEmail({ diagnostico }: { diagnostico: DiagnosticoEmail }) {
  const { config, ultimos30Dias, falhasRecentes } = diagnostico
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<Awaited<ReturnType<typeof enviarTesteDeEmail>> | null>(null)

  const testar = async () => {
    setEnviando(true)
    setResultado(null)
    try {
      setResultado(await enviarTesteDeEmail())
    } catch {
      setResultado({ ok: false, erro: "Não foi possível chamar o servidor. Verifique a conexão." })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-2">
        <div>
          <h2 className="type-intertitle text-foreground">Envio de e-mail</h2>
          <p className="text-[13px] text-text-secondary">Configuração do Resend e resultado real dos envios.</p>
        </div>
        <Button onClick={testar} loading={enviando} disabled={!config.chaveConfigurada}>
          {!enviando && <Send />}
          Enviar e-mail de teste
        </Button>
      </div>

      {resultado && (
        <div
          role="status"
          className={`rounded-lg border border-l-2 px-4 py-3 text-sm ${
            resultado.ok ? "border-success/30 border-l-success bg-success-subtle" : "border-danger/30 border-l-danger bg-danger-subtle"
          }`}
        >
          {resultado.ok ? (
            <p className="text-foreground">
              O Resend aceitou o envio para <span className="font-medium">{resultado.destinatario}</span>. Confira a caixa de
              entrada (e o spam). Id da mensagem: <AuditId valor={resultado.id} curto rotulo="id da mensagem" />
            </p>
          ) : (
            <p className="text-foreground">
              O envio falhou: <span className="type-audit">{resultado.erro}</span>
            </p>
          )}
        </div>
      )}

      <dl className="divide-y divide-border rounded-lg border border-border bg-card">
        <Linha
          ok={config.chaveConfigurada}
          rotulo="Chave do Resend"
          valor={config.chaveConfigurada ? "Configurada (RESEND_API_KEY)" : "Ausente — defina RESEND_API_KEY na Vercel. Nenhum e-mail sai sem ela."}
        />
        <Linha
          ok
          alerta={config.remetentePadrao}
          rotulo="Remetente"
          valor={
            <>
              <span className="type-audit">{config.remetente}</span>
              {config.remetentePadrao && (
                <span className="block text-xs text-text-tertiary">
                  Valor padrão. O domínio fluxteme.com.br precisa estar verificado no Resend.
                </span>
              )}
            </>
          }
        />
        <Linha
          ok
          alerta={config.urlAppPadrao}
          rotulo="Endereço nos links"
          valor={
            <>
              <span className="type-audit break-all">{config.urlApp}</span>
              {config.urlAppPadrao && (
                <span className="block text-xs text-text-tertiary">Valor padrão. Defina NEXT_PUBLIC_APP_URL com o domínio do app.</span>
              )}
            </>
          }
        />
        <Linha
          ok={ultimos30Dias.falhados === 0}
          alerta={ultimos30Dias.enviados === 0 && ultimos30Dias.falhados === 0}
          rotulo="Últimos 30 dias"
          valor={
            <span className="tabular-nums">
              {ultimos30Dias.enviados} enviados · {ultimos30Dias.falhados} com falha · {ultimos30Dias.pendentes} pendentes
            </span>
          }
        />
      </dl>

      {falhasRecentes.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <p className="type-eyebrow border-b border-border px-5 py-3 text-text-tertiary">Falhas mais recentes</p>
          <ul className="divide-y divide-border-subtle">
            {falhasRecentes.map((f, i) => (
              <li key={i} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[11rem_14rem_1fr] sm:gap-4">
                <AuditTimestamp valor={f.quando} className="text-text-secondary" />
                <span className="truncate text-foreground">{f.email}</span>
                <span className="type-audit break-words text-danger">{f.erro ?? "Sem detalhe"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
