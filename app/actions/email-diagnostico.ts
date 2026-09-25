"use server"

import { createAdminClient } from "@/lib/supabase-server"
import { requireRole } from "@/lib/auth-utils"
import { getSession } from "@/lib/session"
import { configuracaoEmail, enviarEmailTeste } from "@/lib/email"

export type DiagnosticoEmail = {
  config: ReturnType<typeof configuracaoEmail>
  ultimos30Dias: { enviados: number; falhados: number; pendentes: number }
  falhasRecentes: { email: string; erro: string | null; quando: string }[]
}

/** Estado do envio de e-mail: configuração e resultado real dos últimos envios. */
export async function obterDiagnosticoEmail(): Promise<DiagnosticoEmail> {
  await requireRole([])
  const supabase = await createAdminClient()
  const desde = new Date(Date.now() - 30 * 86400000).toISOString()

  const [enviados, falhados, pendentes, falhas] = await Promise.all([
    supabase.from("email_envios").select("*", { count: "exact", head: true }).eq("status", "enviado").gte("created_at", desde),
    supabase.from("email_envios").select("*", { count: "exact", head: true }).eq("status", "falhou").gte("created_at", desde),
    supabase.from("email_envios").select("*", { count: "exact", head: true }).eq("status", "pendente").gte("created_at", desde),
    supabase
      .from("email_envios")
      .select("email, erro, created_at")
      .eq("status", "falhou")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return {
    config: configuracaoEmail(),
    ultimos30Dias: { enviados: enviados.count ?? 0, falhados: falhados.count ?? 0, pendentes: pendentes.count ?? 0 },
    falhasRecentes: (falhas.data || []).map((f) => ({ email: f.email, erro: f.erro, quando: f.created_at })),
  }
}

/** Envia um e-mail de teste para o próprio Super Admin e devolve a resposta real do Resend. */
export async function enviarTesteDeEmail(): Promise<{ ok: true; id: string; destinatario: string } | { ok: false; erro: string }> {
  await requireRole([])
  const session = await getSession()
  if (!session?.email) return { ok: false, erro: "Sua conta não tem e-mail cadastrado." }

  try {
    const id = await enviarEmailTeste({ destinatario: session.email, nome: session.nomeCompleto })
    return { ok: true, id, destinatario: session.email }
  } catch (error) {
    return { ok: false, erro: error instanceof Error ? error.message : "Falha desconhecida ao enviar." }
  }
}
