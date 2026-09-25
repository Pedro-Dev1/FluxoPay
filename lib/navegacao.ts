import {
  IconeAceites,
  IconeAcompanhamento,
  IconeAprovacoes,
  IconeAtualizacoes,
  IconeAvisos,
  IconeCadastros,
  IconeCarteiras,
  IconeCriarPedido,
  IconeFaturas,
  IconeFinanceiro,
  IconeNotasEquipe,
  IconePagamentos,
  IconePainel,
  IconePedidos,
  IconePessoas,
  IconePlataforma,
  IconeSenha,
  IconeTermos,
  IconeTrilha,
  IconeUsuarios,
  type FxIcon,
} from "@/components/icons/fx-icons"

// Estrutura única de navegação — sidebar e breadcrumb do cabeçalho leem
// daqui (DESIGN_SYSTEM.md §13 e §15). As permissões (roles) são as mesmas de
// antes da reorganização; cada página continua validando o acesso no
// servidor, o menu só evita mostrar o que a pessoa não pode abrir.

export type Pendencias = { aprovacoes: number; painelFinanceiro: number; correcoes: number; acompanhamento: number }

export interface ItemNav {
  href: string
  label: string
  icon: FxIcon
  roles?: string[]
  contador?: keyof Pendencias
}

export interface GrupoNav {
  titulo: string
  itens: ItemNav[]
}

export const PLATAFORMA: GrupoNav[] = [
  {
    titulo: "Plataforma",
    itens: [
      { href: "/admin", label: "Painel", icon: IconePlataforma },
      { href: "/admin/carteiras", label: "Carteiras", icon: IconeCarteiras },
      { href: "/admin/usuarios", label: "Usuários", icon: IconeUsuarios },
      { href: "/admin/termos", label: "Termos comerciais", icon: IconeTermos },
      { href: "/atualizacoes/gerenciar", label: "Avisos", icon: IconeAvisos },
      { href: "/admin/auditoria", label: "Trilha de auditoria", icon: IconeTrilha },
    ],
  },
]

const OPERACIONAL: GrupoNav[] = [
  {
    titulo: "Visão geral",
    itens: [
      { href: "/", label: "Dashboard", icon: IconePainel, roles: ["Adm", "Gerente", "Financeiro", "Supervisor"] },
      { href: "/atualizacoes", label: "Atualizações", icon: IconeAtualizacoes },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      { href: "/pedidos", label: "Criar pedido", icon: IconeCriarPedido, roles: ["Adm", "Gerente", "Supervisor"] },
      { href: "/historico", label: "Meus pedidos", icon: IconePedidos, roles: ["Gerente", "Supervisor"], contador: "correcoes" },
      { href: "/aprovacoes", label: "Aprovações", icon: IconeAprovacoes, roles: ["Adm", "Gerente", "Financeiro"], contador: "aprovacoes" },
      {
        href: "/acompanhamento",
        label: "Acompanhamento",
        icon: IconeAcompanhamento,
        roles: ["Adm", "Gerente", "Financeiro", "Supervisor"],
        contador: "acompanhamento",
      },
      { href: "/supervisor/notas-equipe", label: "Notas da equipe", icon: IconeNotasEquipe, roles: ["Supervisor"] },
      { href: "/meus-pagamentos", label: "Meus pagamentos", icon: IconePagamentos, roles: ["Gerente", "Financeiro", "Supervisor", "Colaborador"] },
    ],
  },
  {
    titulo: "Financeiro",
    itens: [
      { href: "/financeiro", label: "Painel financeiro", icon: IconeFinanceiro, roles: ["Adm", "Financeiro"], contador: "painelFinanceiro" },
      // A página só abre para Adm e Financeiro (app/faturas/page.tsx); antes o
      // menu mostrava o item para todos e quem clicava voltava para o início.
      { href: "/faturas", label: "Faturas", icon: IconeFaturas, roles: ["Adm", "Financeiro"] },
    ],
  },
  {
    titulo: "Gestão",
    itens: [
      { href: "/cadastros", label: "Cadastros", icon: IconeCadastros, roles: ["Adm", "Financeiro"] },
      { href: "/gestao", label: "Gestão de pessoas", icon: IconePessoas, roles: ["Adm", "Financeiro"] },
      { href: "/cadastros/usuarios", label: "Usuários", icon: IconeUsuarios, roles: ["Adm", "Financeiro"] },
    ],
  },
  {
    titulo: "Auditoria",
    itens: [
      { href: "/historico-completo", label: "Histórico de pedidos", icon: IconeTrilha, roles: ["Adm", "Gerente", "Financeiro"] },
      { href: "/gestao/aceites", label: "Aceites de termos", icon: IconeAceites, roles: ["Adm", "Financeiro"] },
    ],
  },
  {
    titulo: "Sistema",
    itens: [{ href: "/redefinir-senha", label: "Redefinir senha", icon: IconeSenha }],
  },
]

export function gruposDeNavegacao(params: {
  tipoAcesso?: string
  isSuperAdmin?: boolean
  viewingAsTenantId?: string | null
}): GrupoNav[] {
  const { tipoAcesso = "", isSuperAdmin, viewingAsTenantId } = params

  // Super Admin sem carteira escolhida: só a visão de plataforma. Com "ver
  // como", opera também o menu da carteira escolhida.
  if (isSuperAdmin && !viewingAsTenantId) return PLATAFORMA

  const operacional = OPERACIONAL.map((g) => ({
    ...g,
    itens: g.itens.filter((i) => !i.roles || i.roles.includes(tipoAcesso)),
  })).filter((g) => g.itens.length > 0)

  return isSuperAdmin ? [...PLATAFORMA, ...operacional] : operacional
}

/** Item mais específico que corresponde à rota atual (prefixo mais longo). */
export function itemAtivo(grupos: GrupoNav[], pathname: string): { grupo: GrupoNav; item: ItemNav } | null {
  let melhor: { grupo: GrupoNav; item: ItemNav } | null = null
  for (const grupo of grupos) {
    for (const item of grupo.itens) {
      const casa = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/")
      if (casa && (!melhor || item.href.length > melhor.item.href.length)) melhor = { grupo, item }
    }
  }
  return melhor
}
