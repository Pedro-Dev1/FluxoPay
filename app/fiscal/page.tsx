import { getUsuarioLogado } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Search,
  XCircle,
  Calculator,
  BarChart3,
  Building,
  Clock,
  Sparkles,
  Zap,
  Users,
  Brain,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

const cards = [
  {
    title: "Emissão de NFSe",
    description: "Emita notas fiscais de serviço de forma automática.",
    icon: FileText,
    color: "bg-accent text-primary border-primary/30",
  },
  {
    title: "Consulta de Notas",
    description: "Visualize todas as notas fiscais emitidas.",
    icon: Search,
    color: "bg-success-subtle text-success border-success/30",
  },
  {
    title: "Cancelamento de Notas",
    description: "Solicite cancelamento de notas fiscais emitidas.",
    icon: XCircle,
    color: "bg-danger-subtle text-danger border-danger/30",
  },
  {
    title: "Cálculo de Impostos",
    description: "Simule e acompanhe tributos da empresa.",
    icon: Calculator,
    color: "bg-warning-subtle text-warning border-warning/30",
  },
  {
    title: "Relatórios Fiscais",
    description: "Gere relatórios para controle e contabilidade.",
    icon: BarChart3,
    color: "bg-accent text-primary border-primary/30",
  },
  {
    title: "Integração com Prefeituras",
    description: "Emissão automatizada através das prefeituras integradas.",
    icon: Building,
    color: "bg-accent text-primary border-primary/30",
  },
]

const proximasFuncionalidades = [
  { label: "Emissão automática após pagamento", icon: Zap },
  { label: "Integração com contadores", icon: Users },
  { label: "Gestão tributária inteligente", icon: Sparkles },
  { label: "IA para dúvidas fiscais", icon: Brain },
]

export default async function FiscalPage() {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  if (!["Financeiro", "Adm"].includes(usuario.tipo_acesso)) {
    redirect("/")
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <PageHeader
        eyebrow="Financeiro"
        title="Fiscal"
        description="Notas fiscais e obrigações fiscais da carteira, validadas contra contrato e medição."
        meta={<Badge variant="secondary">Em desenvolvimento</Badge>}
      />

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              className="h-full border border-border/60 bg-card opacity-80 cursor-default select-none"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[11px] font-medium text-warning border-warning/30 bg-warning-subtle flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    Em desenvolvimento
                  </Badge>
                </div>
                <CardTitle className="text-base mt-4">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Proximas funcionalidades */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Próximas funcionalidades</h2>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {proximasFuncionalidades.map((item) => {
            const Icon = item.icon
            return (
              <li
                key={item.label}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {item.label}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
