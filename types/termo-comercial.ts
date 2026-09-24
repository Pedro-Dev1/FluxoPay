export type SituacaoTermo = "rascunho" | "em_vigor" | "arquivado"

export interface TermoComercial {
  id: string
  versao: string
  titulo: string
  conteudo: string
  conteudo_sha256: string | null
  publicado_em: string | null
  arquivado_em: string | null
  created_at: string
}

export interface TermoComercialResumo extends TermoComercial {
  situacao: SituacaoTermo
  // Contagem sobre quem precisa aceitar hoje (Adm e Financeiro ativos).
  total_obrigados: number
  total_aceites: number
  total_recusas: number
}

export type SituacaoResposta = "aceitou" | "recusou" | "pendente"

export interface RespostaTermoComercial {
  colaborador_id: string
  nome_completo: string
  email: string
  tipo_acesso: string
  tenant_id: string | null
  tenant_nome: string
  situacao: SituacaoResposta
  respondido_em: string | null
  ip_address: string | null
  user_agent: string | null
}

export function situacaoDoTermo(termo: Pick<TermoComercial, "publicado_em" | "arquivado_em">): SituacaoTermo {
  if (termo.arquivado_em) return "arquivado"
  if (termo.publicado_em) return "em_vigor"
  return "rascunho"
}

// Cargos que precisam aceitar os termos comerciais.
export const CARGOS_TERMO_COMERCIAL = ["Adm", "Financeiro"]
