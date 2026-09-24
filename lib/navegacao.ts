import {
  Bell,
  Building2,
  CheckSquare,
  ClipboardList,
  DollarSign,
  FileSignature,
  FileText,
  History,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Megaphone,
  Receipt,
  ScrollText,
  ShieldCheck,
  SquarePen,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react"

// Estrutura única de navegação — sidebar e breadcrumb do cabeçalho leem
// daqui (DESIGN_SYSTEM.md §13 e §15). As permissões (roles) são as mesmas de
// antes da reorganização; cada página continua validando o acesso no
// servidor, o menu só evita mostrar o que a pessoa não pode abrir.

export type Pendencias = { aprovacoes: number; painelFinanceiro: number; correcoes: number; acompanhamento: number }

export interface ItemNav {
  href: string
  label: string
  icon: LucideIcon
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
      { href: "/admin", label: "Painel", icon: ShieldCheck },
      { href: "/admin/carteiras", label: "Carteiras", icon: Building2 },
      { href: "/admin/usuarios", label: "Usuários", icon: UsersRound },
      { href: "/admin/faturamento", label: "Faturamento", icon: Wallet },
      { href: "/admin/termos", label: "Termos comerciais", icon: FileSignature },
      { href: "/atualizacoes/gerenciar", label: "Avisos", icon: Bell },
      { href: "/admin/auditoria", label: "Trilha de auditoria", icon: ScrollText },
    ],
  },
]

const OPERACIONAL: GrupoNav[] = [
  {
    titulo: "Visão geral",
    itens: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["Adm", "Gerente", "Financeiro", "Supervisor"] },
      { href: "/atualizacoes", label: "Atualizações", icon: Megaphone },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      { href: "/pedidos", label: "Criar pedido", icon: SquarePen, roles: ["Adm", "Gerente", "Supervisor"] },
      { href: "/historico", label: "Meus pedidos", icon: FileText, roles: ["Gerente", "Supervisor"], contador: "correcoes" },
      { href: "/aprovacoes", label: "Aprovações", icon: CheckSquare, roles: ["Adm", "Gerente", "Financeiro"], contador: "aprovacoes" },
      {
        href: "/acompanhamento",
        label: "Acompanhamento",
        icon: ClipboardList,
        roles: ["Adm", "Gerente", "Financeiro", "Supervisor"],
        contador: "acompanhamento",
      },
      { href: "/supervisor/notas-equipe", label: "Notas da equipe", icon: Users, roles: ["Supervisor"] },
      { href: "/meus-pagamentos", label: "Meus pagamentos", icon: Receipt, roles: ["Gerente", "Financeiro", "Supervisor", "Colaborador"] },
    ],
  },
  {
    titulo: "Financeiro",
    itens: [
      { href: "/financeiro", label: "Painel financeiro", icon: DollarSign, roles: ["Adm", "Financeiro"], contador: "painelFinanceiro" },
      // A página só abre para Adm e Financeiro (app/faturas/page.tsx); antes o
      // menu mostrava o item para todos e quem clicava voltava para o início.
      { href: "/faturas", label: "Faturas", icon: FileText, roles: ["Adm", "Financeiro"] },
      { href: "/fiscal", label: "Fiscal", icon: Landmark, roles: ["Adm", "Financeiro"] },
      { href: "/contratos", label: "Contratos", icon: ScrollText, roles: ["Adm", "Financeiro"] },
    ],
  },
  {
    titulo: "Gestão",
    itens: [
      { href: "/cadastros", label: "Cadastros", icon: Building2, roles: ["Adm", "Financeiro"] },
      { href: "/gestao", label: "Gestão de pessoas", icon: UsersRound, roles: ["Adm", "Financeiro"] },
    ],
  },
  {
    titulo: "Auditoria",
    itens: [
      { href: "/historico-completo", label: "Histórico de pedidos", icon: History, roles: ["Adm", "Gerente", "Financeiro"] },
      { href: "/gestao/aceites", label: "Aceites de termos", icon: FileSignature, roles: ["Adm", "Financeiro"] },
    ],
  },
  {
    titulo: "Sistema",
    itens: [{ href: "/redefinir-senha", label: "Redefinir senha", icon: KeyRound }],
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
