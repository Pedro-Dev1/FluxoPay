"use server"

import { headers } from "next/headers"
import { randomBytes } from "crypto"
import { requireAuth } from "@/lib/auth-utils"
import { getSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase-server"
import { EMAIL_SUPORTE, enviarEmailSuporte } from "@/lib/email"
import { CATEGORIAS_SUPORTE } from "@/lib/suporte"

type Resultado = { ok: true; protocolo: string; email: string } | { ok: false; erro: string }

/** Protocolo curto e legível: SUP-AAAAMMDD-XXXX. */
function gerarProtocolo() {
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replace(/-/g, "")
  return `SUP-${dia}-${randomBytes(3).toString("hex").toUpperCase().slice(0, 4)}`
}

// Quem abre o chamado vem da sessão, nunca do formulário: o suporte recebe
// nome, e-mail, cargo e carteira conferidos.
export async function abrirChamadoSuporte(dados: {
  categoria: string
  assunto: string
  descricao: string
  pagina: string
}): Promise<Resultado> {
  const ctx = await requireAuth()
  const session = await getSession()
  if (!session) return { ok: false, erro: "Sua sessão expirou. Entre de novo para abrir o chamado." }

  const categoria = (CATEGORIAS_SUPORTE as readonly string[]).includes(dados.categoria) ? dados.categoria : "Dúvida sobre o sistema"
  const assunto = dados.assunto.trim().slice(0, 140)
  const descricao = dados.descricao.trim().slice(0, 5000)
  if (assunto.length < 3) return { ok: false, erro: "Escreva um assunto com pelo menos 3 caracteres." }
  if (descricao.length < 10) return { ok: false, erro: "Descreva o que precisa com pelo menos 10 caracteres." }

  let carteira = "Sem carteira"
  if (ctx.tenantId) {
    const supabase = await createAdminClient()
    const { data } = await supabase.from("tenants").select("nome").eq("id", ctx.tenantId).maybeSingle()
    if (data?.nome) carteira = data.nome
  }

  const h = await headers()
  const protocolo = gerarProtocolo()
  const quando = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "medium" }).format(new Date())

  try {
    await enviarEmailSuporte({
      protocolo,
      categoria,
      assunto,
      descricao,
      nome: session.nomeCompleto,
      email: session.email,
      cargo: session.isSuperAdmin ? `${session.tipoAcesso} · Super Admin` : session.tipoAcesso,
      carteira,
      pagina: dados.pagina.slice(0, 300) || "—",
      navegador: (h.get("user-agent") || "—").slice(0, 300),
      quando,
    })
  } catch (error) {
    console.error("[v0] Falha ao enviar chamado de suporte:", error)
    return {
      ok: false,
      erro: `Não foi possível enviar agora. Tente de novo em instantes ou escreva direto para ${EMAIL_SUPORTE}.`,
    }
  }

  return { ok: true, protocolo, email: session.email }
}
