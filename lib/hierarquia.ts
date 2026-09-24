import type { getSupabaseServerClient } from "./supabase-server"
import { scopeToTenant, type AuthContext } from "./auth-utils"

// Regra de visibilidade entre cargos: cada pessoa só enxerga quem está
// ABAIXO dela na hierarquia, dentro das equipes que ela lidera. Dois cargos
// iguais nunca se enxergam — nem estando na mesma equipe. Quem aprova,
// lança e acompanha um pedido é sempre o cargo de cima.
//
// Financeiro e Adm continuam enxergando a carteira inteira (não entram aqui).
const CARGOS_SUBORDINADOS: Record<string, string[]> = {
  Colaborador: [],
  Supervisor: ["Colaborador"],
  Gerente: ["Supervisor", "Colaborador"],
}

type Supabase = Awaited<ReturnType<typeof getSupabaseServerClient>>

export function temVisaoRestrita(ctx: Pick<AuthContext, "tipoAcesso" | "isSuperAdmin">): boolean {
  return !ctx.isSuperAdmin && Object.hasOwn(CARGOS_SUBORDINADOS, ctx.tipoAcesso)
}

export async function equipesLideradas(supabase: Supabase, ctx: AuthContext): Promise<string[]> {
  if (ctx.tipoAcesso === "Gerente") {
    const { data, error } = await supabase
      .from("gerentes_equipes")
      .select("equipe_id")
      .eq("gerente_id", ctx.colaboradorId)

    if (error) {
      console.error("[v0] Erro ao buscar equipes do gerente:", error)
      throw new Error("Erro ao buscar equipes do gerente")
    }
    return (data || []).map((e) => e.equipe_id)
  }

  if (ctx.tipoAcesso === "Supervisor") {
    // O supervisor pode estar ligado à equipe pelos dois lados: como
    // equipes.supervisor_id ou pelo próprio colaboradores.equipe_id.
    const [{ data: equipes, error }, { data: proprio }] = await Promise.all([
      supabase.from("equipes").select("id").eq("supervisor_id", ctx.colaboradorId),
      supabase.from("colaboradores").select("equipe_id").eq("id", ctx.colaboradorId).maybeSingle(),
    ])

    if (error) {
      console.error("[v0] Erro ao buscar equipes do supervisor:", error)
      throw new Error("Erro ao buscar equipes do supervisor")
    }

    const ids = new Set((equipes || []).map((e) => e.id))
    if (proprio?.equipe_id) ids.add(proprio.equipe_id)
    return Array.from(ids)
  }

  return []
}

/**
 * Ids dos colaboradores que `ctx` pode enxergar: os de cargo inferior nas
 * equipes que ele lidera. Retorna `null` quando não há restrição
 * (Financeiro, Adm, Super Admin).
 *
 * `incluirProprio` acrescenta o próprio usuário — use em telas de
 * acompanhamento; nunca em filas de aprovação, onde ninguém aprova o
 * próprio pedido.
 */
export async function idsVisiveis(
  supabase: Supabase,
  ctx: AuthContext,
  { incluirProprio }: { incluirProprio: boolean },
): Promise<string[] | null> {
  if (!temVisaoRestrita(ctx)) return null

  const proprio = incluirProprio ? [ctx.colaboradorId] : []
  const cargos = CARGOS_SUBORDINADOS[ctx.tipoAcesso]
  const equipeIds = await equipesLideradas(supabase, ctx)

  if (cargos.length === 0 || equipeIds.length === 0) return proprio

  const { data, error } = await scopeToTenant(
    supabase.from("colaboradores").select("id").in("equipe_id", equipeIds).in("tipo_acesso", cargos),
    ctx,
  )

  if (error) {
    console.error("[v0] Erro ao buscar colaboradores subordinados:", error)
    throw new Error("Erro ao buscar colaboradores da equipe")
  }

  return [...proprio, ...(data || []).map((c) => c.id)]
}

/** Lança erro se `colaboradorId` não estiver abaixo de `ctx` na hierarquia. */
export async function exigirSubordinado(
  supabase: Supabase,
  ctx: AuthContext,
  colaboradorId: string,
  { incluirProprio }: { incluirProprio: boolean },
): Promise<void> {
  const ids = await idsVisiveis(supabase, ctx, { incluirProprio })
  if (ids !== null && !ids.includes(colaboradorId)) {
    throw new Error("Este colaborador não está abaixo de você na hierarquia da equipe")
  }
}
