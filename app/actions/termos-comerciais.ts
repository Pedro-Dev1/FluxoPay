"use server"

import { createHash } from "crypto"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase-server"
import { requireAuth, requireRole } from "@/lib/auth-utils"
import { registrarAuditoria } from "@/lib/auditoria"
import {
  CARGOS_TERMO_COMERCIAL,
  situacaoDoTermo,
  type RespostaTermoComercial,
  type TermoComercial,
  type TermoComercialResumo,
} from "@/types/termo-comercial"

type Resultado = { success: true } | { success: false; error: string }

const CAMPOS_TERMO = "id, versao, titulo, conteudo, conteudo_sha256, publicado_em, arquivado_em, created_at"

function sha256(texto: string): string {
  return createHash("sha256").update(texto, "utf8").digest("hex")
}

async function origemDaRequisicao() {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || null
  return { ip_address: ip, user_agent: h.get("user-agent") || null }
}

async function buscarTermoEmVigor(supabase: Awaited<ReturnType<typeof createAdminClient>>) {
  const { data, error } = await supabase
    .from("termos_comerciais")
    .select(CAMPOS_TERMO)
    .not("publicado_em", "is", null)
    .is("arquivado_em", null)
    .maybeSingle()

  if (error) {
    console.error("[v0] Erro ao buscar termo comercial em vigor:", error)
    throw new Error("Erro ao buscar termo comercial")
  }
  return data as TermoComercial | null
}

// ---------------------------------------------------------------------------
// Usuário (Adm / Financeiro de uma carteira)
// ---------------------------------------------------------------------------

/** Termo em vigor que o usuário logado ainda não aceitou, ou null. */
export async function buscarTermoComercialPendente(): Promise<TermoComercial | null> {
  const ctx = await requireAuth()

  if (ctx.isSuperAdmin || !CARGOS_TERMO_COMERCIAL.includes(ctx.tipoAcesso)) return null

  const supabase = await createAdminClient()
  const termo = await buscarTermoEmVigor(supabase)
  if (!termo) return null

  const { data: aceite } = await supabase
    .from("termos_comerciais_respostas")
    .select("id")
    .eq("termo_id", termo.id)
    .eq("colaborador_id", ctx.colaboradorId)
    .eq("aceito", true)
    .limit(1)
    .maybeSingle()

  return aceite ? null : termo
}

async function responderTermo(termoId: string, aceito: boolean): Promise<Resultado> {
  const ctx = await requireAuth()

  if (ctx.isSuperAdmin || !CARGOS_TERMO_COMERCIAL.includes(ctx.tipoAcesso)) {
    return { success: false, error: "Seu cargo não precisa responder aos termos comerciais" }
  }

  const supabase = await createAdminClient()
  const termo = await buscarTermoEmVigor(supabase)

  // Só vale resposta para a versão em vigor — se o Super Admin publicou outra
  // enquanto o modal estava aberto, a pessoa precisa ler a nova.
  if (!termo || termo.id !== termoId || !termo.conteudo_sha256) {
    return { success: false, error: "Esta versão dos termos não está mais em vigor. Recarregue a página para ler a atual." }
  }

  const { error } = await supabase.from("termos_comerciais_respostas").insert({
    termo_id: termo.id,
    colaborador_id: ctx.colaboradorId,
    tenant_id: ctx.tenantId,
    aceito,
    conteudo_sha256: termo.conteudo_sha256,
    ...(await origemDaRequisicao()),
  })

  if (error) {
    console.error("[v0] Erro ao registrar resposta ao termo comercial:", error)
    return { success: false, error: "Não foi possível registrar sua resposta. Tente de novo em instantes." }
  }

  return { success: true }
}

export async function aceitarTermoComercial(termoId: string): Promise<Resultado> {
  return responderTermo(termoId, true)
}

export async function recusarTermoComercial(termoId: string): Promise<Resultado> {
  return responderTermo(termoId, false)
}

// ---------------------------------------------------------------------------
// Super Admin
// ---------------------------------------------------------------------------

async function listarObrigados(supabase: Awaited<ReturnType<typeof createAdminClient>>) {
  const { data, error } = await supabase
    .from("colaboradores")
    .select("id, nome_completo, email, tipo_acesso, tenant_id, tenant:tenants(nome)")
    .in("tipo_acesso", CARGOS_TERMO_COMERCIAL)
    .eq("ativo", true)
    .eq("is_super_admin", false)
    .not("tenant_id", "is", null)
    .order("nome_completo", { ascending: true })

  if (error) {
    console.error("[v0] Erro ao listar Adm e Financeiro das carteiras:", error)
    throw new Error("Erro ao listar usuários que precisam aceitar")
  }
  return data || []
}

/** Última resposta de cada colaborador para o termo (a lista vem mais recente primeiro). */
async function ultimasRespostas(supabase: Awaited<ReturnType<typeof createAdminClient>>, termoId: string) {
  const { data, error } = await supabase
    .from("termos_comerciais_respostas")
    .select("colaborador_id, aceito, respondido_em, ip_address, user_agent")
    .eq("termo_id", termoId)
    .order("respondido_em", { ascending: false })

  if (error) {
    console.error("[v0] Erro ao listar respostas do termo comercial:", error)
    throw new Error("Erro ao listar respostas do termo")
  }

  const porColaborador = new Map<string, NonNullable<typeof data>[number]>()
  for (const r of data || []) {
    if (!porColaborador.has(r.colaborador_id)) porColaborador.set(r.colaborador_id, r)
  }
  return porColaborador
}

export async function listarTermosComerciais(): Promise<TermoComercialResumo[]> {
  await requireRole([])
  const supabase = await createAdminClient()

  const [{ data: termos, error }, obrigados] = await Promise.all([
    supabase.from("termos_comerciais").select(CAMPOS_TERMO).order("created_at", { ascending: false }),
    listarObrigados(supabase),
  ])

  if (error) {
    console.error("[v0] Erro ao listar termos comerciais:", error)
    throw new Error("Erro ao listar termos comerciais")
  }

  const idsObrigados = new Set(obrigados.map((o) => o.id))

  return Promise.all(
    ((termos || []) as TermoComercial[]).map(async (termo) => {
      const situacao = situacaoDoTermo(termo)
      let total_aceites = 0
      let total_recusas = 0

      if (situacao !== "rascunho") {
        const respostas = await ultimasRespostas(supabase, termo.id)
        for (const [colaboradorId, r] of respostas) {
          if (!idsObrigados.has(colaboradorId)) continue
          if (r.aceito) total_aceites++
          else total_recusas++
        }
      }

      return { ...termo, situacao, total_obrigados: idsObrigados.size, total_aceites, total_recusas }
    }),
  )
}

export async function listarRespostasTermoComercial(termoId: string): Promise<RespostaTermoComercial[]> {
  await requireRole([])
  const supabase = await createAdminClient()

  const [obrigados, respostas] = await Promise.all([listarObrigados(supabase), ultimasRespostas(supabase, termoId)])

  return obrigados.map((o: any) => {
    const r = respostas.get(o.id)
    const tenant = Array.isArray(o.tenant) ? o.tenant[0] : o.tenant
    return {
      colaborador_id: o.id,
      nome_completo: o.nome_completo,
      email: o.email,
      tipo_acesso: o.tipo_acesso,
      tenant_id: o.tenant_id,
      tenant_nome: tenant?.nome || "Sem carteira",
      situacao: r ? (r.aceito ? "aceitou" : "recusou") : "pendente",
      respondido_em: r?.respondido_em ?? null,
      ip_address: r?.ip_address ?? null,
      user_agent: r?.user_agent ?? null,
    }
  })
}

type DadosTermo = { versao: string; titulo: string; conteudo: string }

function validarDados(dados: DadosTermo): DadosTermo | { erro: string } {
  const versao = dados.versao.trim()
  const titulo = dados.titulo.trim()
  const conteudo = dados.conteudo.trim()
  if (!versao || !titulo || !conteudo) return { erro: "Preencha versão, título e texto do termo" }
  if (versao.length > 20) return { erro: "A versão pode ter no máximo 20 caracteres" }
  return { versao, titulo, conteudo }
}

export async function criarTermoComercial(dados: { versao: string; titulo: string; conteudo: string }): Promise<Resultado> {
  const ctx = await requireRole([])
  const validado = validarDados(dados)
  if ("erro" in validado) return { success: false, error: validado.erro }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from("termos_comerciais")
    .insert({ ...validado, criado_por: ctx.colaboradorId })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") return { success: false, error: `Já existe uma versão ${validado.versao}` }
    console.error("[v0] Erro ao criar termo comercial:", error)
    return { success: false, error: "Erro ao salvar rascunho" }
  }

  await registrarAuditoria({
    colaboradorId: ctx.colaboradorId,
    tenantId: null,
    acao: "termo_comercial_criado",
    tabela: "termos_comerciais",
    registroId: data.id,
    detalhes: { versao: validado.versao },
  })

  revalidatePath("/admin/termos")
  return { success: true }
}

export async function atualizarRascunhoTermoComercial(
  id: string,
  dados: { versao: string; titulo: string; conteudo: string },
): Promise<Resultado> {
  const ctx = await requireRole([])
  const validado = validarDados(dados)
  if ("erro" in validado) return { success: false, error: validado.erro }

  const supabase = await createAdminClient()
  // O filtro publicado_em is null garante que texto publicado nunca muda.
  const { data, error } = await supabase
    .from("termos_comerciais")
    .update(validado)
    .eq("id", id)
    .is("publicado_em", null)
    .select("id")
    .maybeSingle()

  if (error) {
    if (error.code === "23505") return { success: false, error: `Já existe uma versão ${validado.versao}` }
    console.error("[v0] Erro ao atualizar rascunho do termo comercial:", error)
    return { success: false, error: "Erro ao salvar rascunho" }
  }
  if (!data) {
    return { success: false, error: "Só rascunhos podem ser editados. Para mudar um termo publicado, crie uma versão nova." }
  }

  await registrarAuditoria({
    colaboradorId: ctx.colaboradorId,
    tenantId: null,
    acao: "termo_comercial_editado",
    tabela: "termos_comerciais",
    registroId: id,
    detalhes: { versao: validado.versao },
  })

  revalidatePath("/admin/termos")
  return { success: true }
}

export async function publicarTermoComercial(id: string): Promise<Resultado> {
  const ctx = await requireRole([])
  const supabase = await createAdminClient()

  const { data: termo } = await supabase
    .from("termos_comerciais")
    .select("id, versao, conteudo, publicado_em")
    .eq("id", id)
    .maybeSingle()

  if (!termo) return { success: false, error: "Versão não encontrada" }
  if (termo.publicado_em) return { success: false, error: "Esta versão já foi publicada" }

  const agora = new Date().toISOString()

  // Arquiva a versão em vigor antes de publicar a nova — o índice único
  // termos_comerciais_um_em_vigor recusa duas em vigor ao mesmo tempo.
  const anterior = await buscarTermoEmVigor(supabase)
  if (anterior) {
    const { error: erroArquivar } = await supabase
      .from("termos_comerciais")
      .update({ arquivado_em: agora })
      .eq("id", anterior.id)
    if (erroArquivar) {
      console.error("[v0] Erro ao arquivar termo comercial anterior:", erroArquivar)
      return { success: false, error: `Não foi possível arquivar a versão ${anterior.versao} em vigor` }
    }
  }

  const { error } = await supabase
    .from("termos_comerciais")
    .update({ publicado_em: agora, conteudo_sha256: sha256(termo.conteudo) })
    .eq("id", id)
    .is("publicado_em", null)

  if (error) {
    console.error("[v0] Erro ao publicar termo comercial:", error)
    return { success: false, error: "Erro ao publicar versão" }
  }

  await registrarAuditoria({
    colaboradorId: ctx.colaboradorId,
    tenantId: null,
    acao: "termo_comercial_publicado",
    tabela: "termos_comerciais",
    registroId: id,
    detalhes: { versao: termo.versao, versao_arquivada: anterior?.versao ?? null },
  })

  revalidatePath("/admin/termos")
  return { success: true }
}

export async function arquivarTermoComercial(id: string): Promise<Resultado> {
  const ctx = await requireRole([])
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("termos_comerciais")
    .update({ arquivado_em: new Date().toISOString() })
    .eq("id", id)
    .not("publicado_em", "is", null)
    .is("arquivado_em", null)
    .select("versao")
    .maybeSingle()

  if (error) {
    console.error("[v0] Erro ao arquivar termo comercial:", error)
    return { success: false, error: "Erro ao arquivar versão" }
  }
  if (!data) return { success: false, error: "Só a versão em vigor pode ser arquivada" }

  await registrarAuditoria({
    colaboradorId: ctx.colaboradorId,
    tenantId: null,
    acao: "termo_comercial_arquivado",
    tabela: "termos_comerciais",
    registroId: id,
    detalhes: { versao: data.versao },
  })

  revalidatePath("/admin/termos")
  return { success: true }
}

export async function excluirRascunhoTermoComercial(id: string): Promise<Resultado> {
  const ctx = await requireRole([])
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("termos_comerciais")
    .delete()
    .eq("id", id)
    .is("publicado_em", null)
    .select("versao")
    .maybeSingle()

  if (error) {
    console.error("[v0] Erro ao excluir rascunho do termo comercial:", error)
    return { success: false, error: "Erro ao excluir rascunho" }
  }
  if (!data) return { success: false, error: "Só rascunhos podem ser excluídos" }

  await registrarAuditoria({
    colaboradorId: ctx.colaboradorId,
    tenantId: null,
    acao: "termo_comercial_rascunho_excluido",
    tabela: "termos_comerciais",
    registroId: id,
    detalhes: { versao: data.versao },
  })

  revalidatePath("/admin/termos")
  return { success: true }
}
